import gql from 'graphql-tag';
import client from '../../client';
import { poll } from '../../utils';
import inquirer from 'inquirer';

const DELETE_PART = gql`
  mutation deletePart($partName: String!) {
    deletePart(name: $partName) {
      id
    }
  }
`;

exports.command = 'part <name>';
exports.desc = 'Delete a part';
exports.builder = {};

exports.handler = async function(argv) {
  console.log(`You are about to DELETE the part '${argv.name}'.`);
  const questions = await inquirer.prompt([
    {
      name: 'confirmation',
      message: 'Please enter the name again to confirm: ',
      type: 'input',
    },
  ]);
  if (questions.confirmation !== argv.name) {
    console.log('Names do not match. Aborting...');
    return;
  }

  console.log(`Deleting part '${argv.name}'...`);
  const response = await client.mutate({
    mutation: DELETE_PART,
    variables: { partName: argv.name },
  });
  const { id } = response.data.deletePart;
  const status = await poll(id);

  if (status === 'Completed') {
    console.log('Done.');
  } else {
    console.log('Failed to delete part.');
    process.exit(1);
  }
};
