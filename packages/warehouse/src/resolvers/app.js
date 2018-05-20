// @flow

import { combineResolvers } from 'graphql-resolvers';
import { ApolloError } from 'apollo-server';
import { isAuthorizedForAction, toJsonOrUndefined } from './utils';
import { createJob } from './jobs';
import type { Context } from '../types';

async function resolveAppByName(root, args, context: Context) {
  const { App } = context.database;

  const app = await App.findByPrimary(args.name);

  return toJsonOrUndefined(app);
}

async function resolveAllApps(root, args, context: Context) {
  const { App } = context.database;

  const apps = await App.all();

  return apps.map(toJsonOrUndefined);
}

async function resolveAppsByPart(part, args, context: Context) {
  const { App, Part } = context.database;

  const apps = await App.findAll({
    include: [
      {
        model: Part,
        where: { name: part.name },
      },
    ],
  });

  return apps.map(toJsonOrUndefined);
}

async function resolveCreateApp(job, { name, configs }, context: Context) {
  const { App, Config } = context.database;

  await context.createApp(job, { name, configs });

  try {
    await App.create({
      name,
    });
  } catch (err) {
    throw new ApolloError('An app with that name already exists.', 'DUPLICATED_KEY');
  }

  if (configs.length > 0) {
    const work = configs.map(config => {
      return Config.upsert({
        appName: name,
        ...config,
      });
    });
    await Promise.all(work);
  }
}

async function resolveDeleteApp(job, { name }, context: Context) {
  const { App } = context.database;

  await context.deleteApp(job, { name });

  const result = await App.destroy({
    where: { name: name },
  });

  if (!result) {
    throw new ApolloError('Application does not exist.');
  }
}

async function resolveAppByBuild(build, args, context: Context) {
  const { App } = context.database;

  const app = await App.findByPrimary(build.appName);

  return toJsonOrUndefined(app);
}

export const appByName = combineResolvers(isAuthorizedForAction('QUERY'), resolveAppByName);
export const allApps = combineResolvers(isAuthorizedForAction('QUERY'), resolveAllApps);
export const appsByPart = combineResolvers(isAuthorizedForAction('QUERY'), resolveAppsByPart);
export const createApp = combineResolvers(
  isAuthorizedForAction('CREATE_APP'),
  createJob(resolveCreateApp)
);

export const deleteApp = combineResolvers(
  isAuthorizedForAction('DELETE_APP'),
  createJob(resolveDeleteApp)
);

export const appByBuild = combineResolvers(isAuthorizedForAction('QUERY'), resolveAppByBuild);
