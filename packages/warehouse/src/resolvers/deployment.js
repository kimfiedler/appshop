// @flow

import { combineResolvers } from 'graphql-resolvers';
import { ApolloError } from 'apollo-server';
import { isAuthorizedForAction, toJsonOrUndefined } from './utils';
import { createJob } from './jobs';
import type { Context } from '../types';

async function resolveDeployBuild(job, { appName, partName, version }, context: Context) {
  const { Deployment, Build } = context.database;

  const build = await Build.findOne({
    where: {
      appName,
      partName,
      version,
    },
  });

  if (!build) {
    throw new ApolloError('Build not found.');
  }

  await Deployment.create({
    buildId: build.id,
  });
}

async function resolveCurrentDeploymentsByApp(app, args, context: Context) {
  const { Build, Deployment } = context.database;

  const deployments = await Deployment.findAll({
    include: [
      {
        model: Build,
        where: { appName: app.name },
      },
    ],
    order: ['id'],
  });

  const allDeployments = deployments.map(toJsonOrUndefined);
  const reversed = [...allDeployments].reverse();

  function onlyLatestOfPart(deployment) {
    const lastOfPart = reversed.find(last => last.build.partName === deployment.build.partName);

    return lastOfPart.id === deployment.id;
  }

  return allDeployments.filter(onlyLatestOfPart);
}

export const deployBuild = combineResolvers(
  isAuthorizedForAction('CREATE_BUILD'),
  createJob(resolveDeployBuild)
);
export const currentDeploymentsByApp = combineResolvers(
  isAuthorizedForAction('QUERY'),
  resolveCurrentDeploymentsByApp
);
