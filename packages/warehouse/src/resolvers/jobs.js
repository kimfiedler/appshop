import Sequelize from 'sequelize';
import { ApolloError } from 'apollo-server';

import { combineResolvers } from 'graphql-resolvers';
import { isAuthorizedForAction, toJsonOrUndefined } from './utils';
import type { Context } from '../types';
import { createQuerier } from '../query';

export function createJob(resolver) {
  return async function(root, args, context: Context) {
    const { Job, JobMessage } = context.database;

    function createLogger(id) {
      return async function log(message) {
        return JobMessage.create({
          jobId: id,
          message,
        });
      };
    }

    function updateJobWithStatus(id, status) {
      return Job.update(
        { status },
        {
          where: {
            id,
          },
        }
      );
    }

    const job = await Job.create({
      status: 'Running',
    });

    setTimeout(async function() {
      const log = createLogger(job.id);
      const query = createQuerier(context);
      try {
        await resolver({ log, query, id: job.id }, args, context);
        await updateJobWithStatus(job.id, 'Completed');
      } catch (err) {
        if (err instanceof ApolloError) {
          await log(err.message);
        } else {
          console.log('Job failed', err);
        }
        await updateJobWithStatus(job.id, 'Failed');
      }
    }, 0);

    return job.toJSON();
  };
}

async function resolveJobDetails(root, { id, messageId }, context: Context) {
  const { Job, JobMessage } = context.database;

  const job = await Job.findByPrimary(id);
  const messages = await JobMessage.findAll({
    where: {
      jobId: id,
      id: {
        [Sequelize.Op.gt]: messageId,
      },
    },
  });

  return {
    ...job.toJSON(),
    messages: messages.map(toJsonOrUndefined),
  };
}

export const jobDetails = combineResolvers(isAuthorizedForAction('QUERY'), resolveJobDetails);
