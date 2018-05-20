import gql from 'graphql-tag';
import client from '../../client';
import columnify from 'columnify';

const LIST_APPS = gql`
  query apps {
    apps {
      name
      parts {
        name
      }
    }
  }
`;

async function listApps() {
  console.log('Applications defined:');
  console.log();
  try {
    const response = await client.query({
      query: LIST_APPS,
    });

    const header = ['Name', 'Number of parts'];
    const rows = response.data.apps.map(app => {
      return [app.name, app.parts.length];
    });

    const columns = columnify([header, ...rows], {
      minWidth: 40,
      showHeaders: false,
    });

    console.log(columns);
  } catch (err) {
    console.log('Failed to list applications.');
  }
}

exports.command = 'apps';
exports.desc = 'List all applications';
exports.builder = {};
exports.handler = function(argv) {
  listApps();
};
