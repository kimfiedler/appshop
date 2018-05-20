import { combineResolvers } from 'graphql-resolvers';
import { isAuthorizedForAction, toJsonOrUndefined } from './utils';
import { createJob } from './jobs';

import type { Context } from '../types';

async function resolveConfigsByApp(app, args, context: Context) {
  const { App, Config } = context.database;

  const configs = await Config.findAll({
    include: [
      {
        model: App,
        where: { name: app.name },
      },
    ],
  });

  return configs.map(toJsonOrUndefined);
}

async function resolveSetAppConfig(job, { appName, configs }, context: Context) {
  const { Config } = context.database;

  await context.setConfig(job, { appName, configs });

  const work = configs.map(config =>
    Config.upsert({
      appName,
      ...config,
    })
  );

  await Promise.all(work);
}

async function resolveDeleteAppConfig(job, { appName, configs }, context: Context) {
  const { Config } = context.database;

  const keys = configs.map(({ key }) => key);

  await context.deleteConfig(job, { appName, keys });

  const work = keys.map(key =>
    Config.destroy({
      where: {
        appName,
        key,
      },
    })
  );

  await Promise.all(work);
}

export const configsByApp = combineResolvers(isAuthorizedForAction('QUERY'), resolveConfigsByApp);
export const setAppConfig = combineResolvers(
  isAuthorizedForAction('UPDATE_CONFIG'),
  createJob(resolveSetAppConfig)
);
export const deleteAppConfig = combineResolvers(
  isAuthorizedForAction('UPDATE_CONFIG'),
  createJob(resolveDeleteAppConfig)
);
