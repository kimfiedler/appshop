import gql from 'graphql-tag';
import client from '../../client';
import columnify from 'columnify';

const APP_INFO = gql`
  query appInfo($appName: String!) {
    app(name: $appName) {
      name
      configs {
        key
        value
      }
      parts {
        name
      }
      currentDeployments {
        createdAt
        build {
          part {
            name
          }
          version
        }
      }
    }
  }
`;

async function appInfo(appName) {
  try {
    const response = await client.query({
      query: APP_INFO,
      variables: {
        appName,
      },
    });
    const { app } = response.data;
    console.log('Name: ', app.name);
    if (app.configs.length > 0) {
      console.log();
      console.log('Configs');
      app.configs.forEach(config => {
        console.log(`${config.key}=${config.value}`);
      });
    }

    if (app.currentDeployments.length > 0) {
      console.log();
      console.log('Currently deployed parts');

      const header = ['Part', 'Version', 'Time'];
      const rows = app.currentDeployments.map(deployment => {
        return [deployment.build.part.name, deployment.build.version, deployment.createdAt];
      });

      const columns = columnify([header, ...rows], {
        minWidth: 40,
        showHeaders: false,
      });

      console.log(columns);
    }

    if (app.parts.length > 0) {
      console.log();

      console.log(`Parts (${app.parts.length})`);
      app.parts.forEach(part => {
        console.log(part.name);
      });
    }
  } catch (err) {
    console.log('Failed to list applications.');
  }
}

exports.command = 'app <name>';
exports.desc = 'Info about an application';
exports.builder = {};
exports.handler = function(argv) {
  appInfo(argv.name);
};
