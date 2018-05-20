// @flow

import { combineResolvers } from 'graphql-resolvers';
import { ApolloError } from 'apollo-server';
import { isAuthorizedForAction, toJsonOrUndefined } from './utils';
import { createJob } from './jobs';
import type { Context } from '../types';

async function resolveCreateBuild(
  job,
  { partName, appName, version, url, tarballUrl, config },
  context: Context
) {
  const { Build } = context.database;

  await Build.create({
    partName,
    appName,
    version,
    url,
    tarballUrl,
    config,
  });
}

async function resolveBuildsByPart(part, args, context: Context) {
  const { Part, Build } = context.database;

  const builds = await Build.findAll({
    include: [
      {
        model: Part,
        where: { name: part.name },
      },
    ],
  });

  return builds.map(toJsonOrUndefined);
}

export const createBuild = combineResolvers(
  isAuthorizedForAction('CREATE_BUILD'),
  createJob(resolveCreateBuild)
);
export const buildsByPart = combineResolvers(isAuthorizedForAction('QUERY'), resolveBuildsByPart);
