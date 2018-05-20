import gql from 'graphql-tag';
import client from '../client';
import { poll } from '../utils';

const DEPLOY_BUILD = gql`
  mutation deployBuild($appName: String!, $partName: String!, $version: String!) {
    deployBuild(appName: $appName, partName: $partName, version: $version) {
      id
      status
    }
  }
`;

async function deployBuild(appName, partName, version) {
  console.log(`Deploying version ${version} of ${partName} in ${appName}...`);

  const response = await client.mutate({
    mutation: DEPLOY_BUILD,
    variables: {
      appName,
      partName,
      version,
    },
  });
  const { id } = response.data.deployBuild;
  const status = await poll(id);

  if (status === 'Completed') {
    console.log('Done.');
  } else {
    console.log('Failed to deploy.');
    process.exit(1);
  }
}

exports.command = 'deploy <application> <part> <versionNo>';
exports.desc = 'Deploy a build';
exports.builder = {};
exports.handler = function(argv) {
  deployBuild(argv.application, argv.part, argv.versionNo);
};
