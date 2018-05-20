import gql from 'graphql-tag';
import client from '../../client';
import { coerceConfig, poll } from '../../utils';

const SET_APP_CONFIG = gql`
  mutation setAppConfig($appName: String!, $configs: [ConfigInput!]) {
    setAppConfig(appName: $appName, configs: $configs) {
      id
    }
  }
`;

async function setAppConfig(appName, configs = []) {
  console.log(`Setting configuration in '${appName}'...`);
  const response = await client.mutate({
    mutation: SET_APP_CONFIG,
    variables: { appName, configs },
  });
  const { id } = response.data.setAppConfig;
  const status = await poll(id);

  if (status === 'Completed') {
    console.log('Done.');
  } else {
    console.log('Failed to set application configuration');
    process.exit(1);
  }
}

exports.command = 'set <name> [key] [value]';
exports.desc = 'Set configuration of application';
exports.builder = yargs => {
  return yargs
    .option('config', {
      type: 'array',
      describe: 'Configs in the form key=value',
    })
    .coerce('config', coerceConfig);
};
exports.handler = async function(argv) {
  const configs = argv.config || [];
  if (typeof argv.key !== 'undefined' && typeof argv.value !== 'undefined') {
    configs.push({ key: argv.key, value: argv.value });
  }

  if (configs.length === 0) {
    console.error('No configs provided to set.');
    process.exit(1);
  }

  setAppConfig(argv.name, configs);
};
