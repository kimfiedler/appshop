import gql from 'graphql-tag';
import client from './client';

export function coerceConfig(arg) {
  return arg.map(config => {
    const [key, value] = config.split('=');

    if (typeof value === 'undefined') {
      throw new Error('config must be in the form key=value. For example --config IS_ENABLED=true');
    }

    return {
      key,
      value,
    };
  });
}

const JOB_DETAILS = gql`
  query jobDetailsAfterMessageId($id: ID!, $messageId: ID!) {
    jobDetailsAfterMessageId(id: $id, messageId: $messageId) {
      status
      messages {
        id
        message
      }
    }
  }
`;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function poll(jobId) {
  let state = 'Running';
  let lastId = 0;

  while (state === 'Running') {
    await delay(1000);
    const response = await client.query({
      query: JOB_DETAILS,
      fetchPolicy: 'no-cache',
      variables: {
        id: jobId,
        messageId: lastId,
      },
    });

    const { status, messages } = response.data.jobDetailsAfterMessageId;
    state = status;

    if (messages.length > 0) {
      lastId = messages[messages.length - 1].id;
    }

    messages.forEach(({ id, message }) => {
      console.log(message);
    });
  }

  return state;
}
