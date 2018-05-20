import gql from 'graphql-tag';
import client from '../client';
import { poll } from '../utils';

const ATTACH_PART = gql`
  mutation attachPartToApp($partName: String!, $appName: String!) {
    attachPartToApp(partName: $partName, appName: $appName) {
      id
    }
  }
`;

async function attachPart(partName, appName) {
  console.log(`Attaching ${partName} to ${appName}...`);

  const response = await client.mutate({
    mutation: ATTACH_PART,
    variables: {
      partName,
      appName,
    },
  });
  const { id } = response.data.attachPartToApp;
  const status = await poll(id);

  if (status === 'Completed') {
    console.log('Done.');
  } else {
    console.log('Failed to attach part to application.');
    process.exit(1);
  }
}

exports.command = 'attach <part> <application>';
exports.desc = 'Attach a part to an application';
exports.builder = {};
exports.handler = function(argv) {
  attachPart(argv.part, argv.application);
};
