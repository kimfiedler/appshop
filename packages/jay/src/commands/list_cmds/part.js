import gql from 'graphql-tag';
import client from '../../client';
import columnify from 'columnify';

const LIST_PARTS = gql`
  query apps {
    parts {
      name
    }
  }
`;

async function listParts() {
  console.log('Parts defined:');
  console.log();
  try {
    const response = await client.query({
      query: LIST_PARTS,
    });

    const header = ['Name'];
    const rows = response.data.parts.map(part => {
      return [part.name];
    });

    const columns = columnify([header, ...rows], {
      minWidth: 40,
      showHeaders: false,
    });

    console.log(columns);
  } catch (err) {
    console.log('Failed to list parts.');
  }
}

exports.command = 'parts';
exports.desc = 'List all parts';
exports.builder = {};
exports.handler = function(argv) {
  listParts();
};
