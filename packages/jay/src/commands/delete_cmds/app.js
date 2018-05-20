import gql from 'graphql-tag';
import client from '../../client';
import { poll } from '../../utils';
import inquirer from 'inquirer';

const DELETE_APP = gql`
  mutation deleteApp($appName: String!) {
    deleteApp(name: $appName) {
      id
    }
  }
`;

exports.command = 'app <name>';
exports.desc = 'Delete an application';
exports.builder = {};
exports.handler = async function(argv) {
  console.log(`You are about to DELETE the application '${argv.name}'.`);
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

  console.log(`Deleting application '${argv.name}'...`);
  const response = await client.mutate({
    mutation: DELETE_APP,
    variables: { appName: argv.name },
  });

  const { id } = response.data.deleteApp;
  const status = await poll(id);

  if (status === 'Completed') {
    console.log('Done.');
  } else {
    console.log('Failed to delete application.');
    process.exit(1);
  }
};
