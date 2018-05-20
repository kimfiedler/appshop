import gql from 'graphql-tag';
import client from '../../client';
import { poll } from '../../utils';
import { coerceConfig } from '../../utils';

const CREATE_APP = gql`
  mutation createApp($appName: String!, $configs: [ConfigInput!]) {
    createApp(name: $appName, configs: $configs) {
      id
    }
  }
`;

async function createApp(appName, configs = []) {
  console.log(`Creating new application '${appName}'...`);
  const response = await client.mutate({
    mutation: CREATE_APP,
    variables: { appName, configs },
  });

  const { id } = response.data.createApp;
  const status = await poll(id);

  if (status === 'Completed') {
    console.log('Done.');
  } else {
    console.log('Failed to create application.');
    process.exit(1);
  }
}

exports.command = 'app <name>';
exports.desc = 'Create a new application';
exports.builder = yargs => {
  return yargs
    .option('config', {
      type: 'array',
      describe: 'Configs in the form key=value',
    })
    .coerce('config', coerceConfig);
};
exports.handler = async function(argv) {
  createApp(argv.name, argv.config);
};
