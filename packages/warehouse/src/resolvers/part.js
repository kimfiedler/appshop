// @flow

import { combineResolvers } from 'graphql-resolvers';
import { ApolloError } from 'apollo-server';
import { isAuthorizedForAction, toJsonOrUndefined } from './utils';
import { createJob } from './jobs';
import type { Context } from '../types';

async function resolvePartByName(root, args, context: Context) {
  const { Part } = context.database;

  const part = await Part.findByPrimary(args.name);

  return toJsonOrUndefined(part);
}

async function resolveAllParts(root, args, context: Context) {
  const { Part } = context.database;

  const parts = await Part.all();

  return parts.map(toJsonOrUndefined);
}

async function resolvePartsByApp(app, args, context: Context) {
  const { App, Part } = context.database;

  const parts = await Part.findAll({
    include: [
      {
        model: App,
        where: { name: app.name },
      },
    ],
  });

  return parts.map(toJsonOrUndefined);
}

async function resolveCreatePart(job, { name, apps }, context: Context) {
  const { Part } = context.database;

  await context.createPart(job, { name, apps });

  try {
    const part = await Part.create({
      name,
    });

    if (apps.length > 0) {
      await part.addApps(apps);
    }

    return part.toJSON();
  } catch (err) {
    if (err.name) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw new ApolloError('A part with that name already exists.', 'DUPLICATED_KEY');
      } else if (err.name === 'SequelizeForeignKeyConstraintError') {
        throw new ApolloError('Appliation does not exist.', 'APP_DOES_NOT_EXIST');
      }
    }
    throw err;
  }
}

async function resolveDeletePart(job, { name }, context: Context) {
  const { Part } = context.database;

  await context.deletePart(job, { name });

  const result = await Part.destroy({
    where: { name: name },
  });

  if (!result) {
    throw new ApolloError('Part does not exist.');
  }
}

async function resolveAttachPartToApp(job, { partName, appName }, context: Context) {
  const { Part } = context.database;

  await context.attachPart(job, { appName, partName });

  const part = await Part.findByPrimary(partName);
  if (!part) {
    throw new ApolloError('Part does not exist.');
  }

  const result = await part.addApp(appName);

  if (!result) {
    throw new ApolloError('Application does not exist.');
  }
}

async function resolveDetachPartFromApp(job, { partName, appName }, context: Context) {
  const { Part } = context.database;

  await context.detachPart(job, { appName, partName });

  const part = await Part.findByPrimary(partName);
  if (!part) {
    throw new ApolloError('Part does not exist.');
  }
  const result = await part.removeApp(appName);

  if (!result) {
    throw new ApolloError('Application does not exist or is not attached to part.');
  }
}

async function resolvePartByBuild(build, args, context: Context) {
  const { Part } = context.database;

  const part = await Part.findByPrimary(build.partName);

  return toJsonOrUndefined(part);
}

export const partByName = combineResolvers(isAuthorizedForAction('QUERY'), resolvePartByName);
export const allParts = combineResolvers(isAuthorizedForAction('QUERY'), resolveAllParts);
export const partsByApp = combineResolvers(isAuthorizedForAction('QUERY'), resolvePartsByApp);
export const createPart = combineResolvers(
  isAuthorizedForAction('CREATE_PART'),
  createJob(resolveCreatePart)
);
export const deletePart = combineResolvers(
  isAuthorizedForAction('DELETE_PART'),
  createJob(resolveDeletePart)
);
export const attachPartToApp = combineResolvers(
  isAuthorizedForAction('ATTACH_PART'),
  createJob(resolveAttachPartToApp)
);
export const detachPartFromApp = combineResolvers(
  isAuthorizedForAction('DETACH_PART'),
  createJob(resolveDetachPartFromApp)
);
export const partByBuild = combineResolvers(isAuthorizedForAction('QUERY'), resolvePartByBuild);
