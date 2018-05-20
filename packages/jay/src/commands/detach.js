import gql from 'graphql-tag';
import client from '../client';
import { poll } from '../utils';

const DETACH_PART = gql`
  mutation detachPartFromApp($partName: String!, $appName: String!) {
    detachPartFromApp(partName: $partName, appName: $appName) {
      id
    }
  }
`;

async function detachPart(partName, appName) {
  console.log(`Detaching ${partName} from ${appName}...`);

  const response = await client.mutate({
    mutation: DETACH_PART,
    variables: {
      partName,
      appName,
    },
  });
  const { id } = response.data.detachPartFromApp;
  const status = await poll(id);

  if (status === 'Completed') {
    console.log('Done.');
  } else {
    console.log('Failed to attach part to application.');
    process.exit(1);
  }
}

exports.command = 'detach <part> <application>';
exports.desc = 'Detach a part from an application';
exports.builder = {};
exports.handler = function(argv) {
  detachPart(argv.part, argv.application);
};
