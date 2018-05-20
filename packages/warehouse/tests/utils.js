// @flow

import { graphql } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import invariant from 'invariant';
import { typeDefs, resolvers } from '../src/schema';
import type { Context } from '../src/types';
import initializeDatabase from '../src/db';

export async function createContext(options: {} = {}): Promise<Context> {
  const database = initializeDatabase({
    dialect: 'sqlite',
  });
  await database.connect();
  const isAuthorizedForAction = () => true;
  const context = {
    isAuthorizedForAction,
    database,
    createApp: () => {},
    deleteApp: () => {},
    createPart: () => {},
    deletePart: () => {},
    attachPart: () => {},
    detachPart: () => {},
    setConfig: () => {},
    deleteConfig: () => {},
    deployBuild: () => {},
    ...options,
  };

  return context;
}

const schema = makeExecutableSchema({ typeDefs, resolvers });

export async function query(queryString: string, context: Context) {
  const result = await graphql(schema, queryString, null, context);

  return result;
}

export async function queryAndCompleteJob(queryString: string, context: Context, jobName: string) {
  const response = await query(queryString, context);

  const job = response.data && response.data[jobName];

  if (!job) {
    throw new Error(`Could not find job in response: ${JSON.stringify(response)}`);
  }

  let { status, id } = job;

  while (status === 'Running') {
    const jobResponse = await query(
      `query {
      jobDetailsAfterMessageId(id: ${id}, messageId: 0) {
        status
      }
    }`,
      context
    );

    invariant(
      jobResponse.data &&
        jobResponse.data.jobDetailsAfterMessageId &&
        typeof jobResponse.data.jobDetailsAfterMessageId.status === 'string',
      'Failed to read status from job'
    );
    status = jobResponse.data.jobDetailsAfterMessageId.status;
  }

  return status;
}
