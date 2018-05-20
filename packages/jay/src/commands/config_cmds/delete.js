import gql from 'graphql-tag';
import { poll } from '../../utils';
import client from '../../client';

const DELETE_APP_CONFIG = gql`
  mutation deleteAppConfig($appName: String!, $configs: [ConfigDeleteInput!]) {
    deleteAppConfig(appName: $appName, configs: $configs) {
      id
    }
  }
`;

async function deleteAppConfig(appName, configs = []) {
  console.log(`Deleting configuration in '${appName}'...`);
  const response = await client.mutate({
    mutation: DELETE_APP_CONFIG,
    variables: { appName, configs },
  });
  const { id } = response.data.deleteAppConfig;
  const status = await poll(id);

  if (status === 'Completed') {
    console.log('Done.');
  } else {
    console.log('Failed to delete application configuration');
    process.exit(1);
  }
}

exports.command = 'delete <name> [key]';
exports.desc = 'Delete configuration of application';
exports.builder = yargs => {
  return yargs
    .option('config', {
      type: 'array',
      describe: 'A list of keys to delete',
    })
    .coerce('config', arg => arg.map(key => ({ key })));
};
exports.handler = function(argv) {
  const keys = argv.config || [];
  if (typeof argv.key !== 'undefined') {
    keys.push({ key: argv.key });
  }

  if (keys.length === 0) {
    console.error('No configs provided to set.');
    process.exit(1);
  }

  deleteAppConfig(argv.name, keys);
};
