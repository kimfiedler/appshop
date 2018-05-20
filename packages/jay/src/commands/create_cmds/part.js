import gql from 'graphql-tag';
import { poll } from '../../utils';
import client from '../../client';

const CREATE_PART = gql`
  mutation createPart($partName: String!, $apps: [String!]) {
    createPart(name: $partName, apps: $apps) {
      id
    }
  }
`;

async function createPart(partName, apps = []) {
  console.log(`Creating new part '${partName}'...`);

  const response = await client.mutate({
    mutation: CREATE_PART,
    variables: {
      partName,
      apps,
    },
  });

  const { id } = response.data.createPart;
  const status = await poll(id);

  if (status === 'Completed') {
    console.log('Done.');
  } else {
    console.log('Failed to create part.');
    process.exit(1);
  }
}

exports.command = 'part <name>';
exports.desc = 'Create a new part';
exports.builder = yargs => {
  yargs.option('apps', {
    type: 'array',
    describe: 'Apps to attach newly created part to',
  });
};
exports.handler = async function(argv) {
  createPart(argv.name, argv.apps);
};
