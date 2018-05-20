// @flow

import curry from 'lodash/fp/curry';
import express from 'express';
import type { $Application } from 'express';
import { ApolloServer } from 'apollo-server';
import { registerServer } from 'apollo-server-express';
import serveIndex from 'serve-index';
import initializeDatabase from './db';
import registerUploadHandler from './files';
import { typeDefs, resolvers } from './schema';

import type { WarehouseOptions, Context } from './types';

export default function startWarehouse(app: $Application, options: WarehouseOptions) {
  registerUploadHandler(app, options.fileDropLocation);

  app.use(
    '/builds',
    express.static(options.fileDropLocation),
    serveIndex(options.fileDropLocation)
  );

  const isAuthorizedForAction = curry(options.isAuthorizedForAction);
  const database = initializeDatabase(options.database);

  function createContext({ req }): Context {
    return {
      isAuthorizedForAction: isAuthorizedForAction(req),
      database,
      createApp: options.createApp ? options.createApp : () => {},
      deleteApp: options.deleteApp ? options.deleteApp : () => {},
      createPart: options.createPart ? options.createPart : () => {},
      deletePart: options.deletePart ? options.deletePart : () => {},
      attachPart: options.attachPart ? options.attachPart : () => {},
      detachPart: options.detachPart ? options.detachPart : () => {},
      setConfig: options.setConfig ? options.setConfig : () => {},
      deleteConfig: options.deleteConfig ? options.deleteConfig : () => {},
      deployBuild: options.deployBuild ? options.deployBuild : () => {},
    };
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
  });

  registerServer({ server, app });

  // Start the server
  database.connect().then(() => {
    server.listen().then(({ url }) => {
      console.log(`🚀 Server ready at ${url}`);
    });
  });
}
