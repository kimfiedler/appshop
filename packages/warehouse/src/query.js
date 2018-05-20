import { graphql } from 'graphql';
import { typeDefs, resolvers } from './schema';
import { makeExecutableSchema } from 'graphql-tools';

export function createQuerier(context: Context) {
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  return async function query(queryString: string) {
    const result = await graphql(schema, queryString, null, {
      ...context,
      isAuthorizedForAction: () => true,
    });

    return result;
  };
}
