import readPkgUp from 'read-pkg-up';
import gql from 'graphql-tag';
import client from '../client';
import spawn from 'cross-spawn';
import tar from 'tar';
import tmp from 'tmp';
import request from 'superagent';
import { poll } from '../utils';

const PART_INFO = gql`
  query partInfo($partName: String!) {
    part(name: $partName) {
      name
      apps {
        name
        configs {
          key
          value
        }
      }
    }
  }
`;

const CREATE_BUILD = gql`
  mutation createBuild(
    $appName: String!
    $partName: String!
    $version: String!
    $tarballUrl: String!
    $url: String!
    $config: String!
  ) {
    createBuild(
      appName: $appName
      partName: $partName
      version: $version
      tarballUrl: $tarballUrl
      url: $url
      config: $config
    ) {
      id
      status
    }
  }
`;

async function findCurrentPartName() {
  const { pkg } = await readPkgUp();

  return pkg.name;
}

async function getAppsAndConfigs(partName) {
  const response = await client.query({
    query: PART_INFO,
    variables: {
      partName,
    },
  });
  const { part } = response.data;

  return part.apps;
}

function createConfigKeyValuePair(configs) {
  return configs.reduce((result, { key, value }) => {
    result[key] = value;

    return result;
  }, {});
}

async function buildApp(app, config) {
  console.log(`Building for application ${app.name}...`);

  const env = { ...process.env, ...config };
  const proc = spawn.sync('yarnpkg', ['build'], { stdio: 'inherit', env });

  if (proc.status !== 0) {
    console.error('Build failed.');
    process.exit(proc.status);
  }
}

async function createTarball(app, name) {
  const tmpFile = tmp.fileSync({ postfix: '.tar.gz' });

  await tar.c(
    {
      gzip: true,
      file: tmpFile.name,
    },
    ['lib']
  );

  return tmpFile.name;
}

async function uploadApp(appName, partName, version, tarballPath) {
  const response = await request
    .post('http://localhost:4000/upload')
    .field('appName', appName)
    .field('partName', partName)
    .field('version', version)
    .attach('part', tarballPath);

  if (response.statusCode !== 200) {
    console.error('Upload failed', response.statusCode);
    process.exit(1);
  }
}

async function createBuild(appName, partName, version, config) {
  const response = await client.mutate({
    mutation: CREATE_BUILD,
    variables: {
      partName,
      appName,
      version,
      tarballUrl: `http://localhost:4000/files/${appName}/${partName}/${version}.tar.gz`,
      url: `http://localhost:4000/files/${appName}/${partName}/${version}/`,
      config: JSON.stringify(config),
    },
  });
  const { id } = response.data.createBuild;
  const status = await poll(id);

  if (status === 'Completed') {
    console.log('Done.');
  } else {
    console.log('Failed to create build.');
    process.exit(1);
  }
}

exports.command = 'build <versionNo>';
exports.desc = 'Build the part in current working directory';
exports.builder = {};
exports.handler = async function(argv) {
  const name = await findCurrentPartName();
  const apps = await getAppsAndConfigs(name);

  for (let app of apps) {
    const config = createConfigKeyValuePair(app.configs);
    await buildApp(app, config);
    const tarballPath = await createTarball(app);
    await uploadApp(app.name, name, argv.versionNo, tarballPath);
    await createBuild(app.name, name, argv.versionNo, config);
  }
};
