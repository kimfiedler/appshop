import gql from 'graphql-tag';
import client from '../../client';

const PART_INFO = gql`
  query partInfo($partName: String!) {
    part(name: $partName) {
      name
      apps {
        name
      }
    }
  }
`;

async function partInfo(partName) {
  try {
    const response = await client.query({
      query: PART_INFO,
      variables: {
        partName,
      },
    });
    const { part } = response.data;
    console.log('Name: ', part.name);

    if (part.apps.length > 0) {
      console.log();
      console.log(`Applications (${part.apps.length})`);
      part.apps.forEach(app => {
        console.log(app.name);
      });
    }
  } catch (err) {
    console.log('Failed to list part.');
  }
}

exports.command = 'part <name>';
exports.desc = 'Info about a part';
exports.builder = {};
exports.handler = function(argv) {
  partInfo(argv.name);
};
