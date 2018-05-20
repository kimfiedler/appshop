// @flow

import { ForbiddenError } from 'apollo-server';
import { skip } from 'graphql-resolvers';

import type { Action, Context } from '../types';

export function isAuthorizedForAction(actionName: Action) {
  return function(root: any, args: any, context: Context) {
    return context.isAuthorizedForAction(actionName)
      ? skip
      : new ForbiddenError(`User is not authorized for action ${actionName}.`);
  };
}

export function toJsonOrUndefined(result?: { toJSON: () => any }) {
  if (result) {
    return result.toJSON();
  }
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
