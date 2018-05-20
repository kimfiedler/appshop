// @flow

import type { $Request } from 'express';
import initializeDatabase from './db';
import type { ExecutionResult } from 'graphql';

export type Action =
  | 'QUERY'
  | 'CREATE_APP'
  | 'DELETE_APP'
  | 'UPDATE_CONFIG'
  | 'CREATE_PART'
  | 'DELETE_PART'
  | 'ATTACH_PART'
  | 'DETACH_PART'
  | 'CREATE_BUILD';

export type MySQLOptions = {
  dialect: 'mysql',
  database: string,
  host: string,
  port: number,
  username: string,
  password: string,
};

export type SQLiteOptions = {
  dialect: 'sqlite',
  storage?: string,
};

export type DatabaseOptions = MySQLOptions | SQLiteOptions;

type Config = {
  key: string,
  value: string,
};

type JobFunctionContext = {
  id: number,
  log: (message: string) => Promise<void>,
  query: (queryString: string) => Promise<ExecutionResult>,
};

type JobFunctionReturn = Promise<void> | void;

type CreateAppJobFunction = (
  context: JobFunctionContext,
  args: { name: string, configs: Array<Config> }
) => JobFunctionReturn;

type DeleteAppJobFunction = (
  context: JobFunctionContext,
  args: { name: string }
) => JobFunctionReturn;

type CreatePartJobFunction = (
  context: JobFunctionContext,
  args: { name: string, apps: Array<string> }
) => JobFunctionReturn;

type DeletePartJobFunction = (
  context: JobFunctionContext,
  args: { name: string }
) => JobFunctionReturn;

type AttachPartJobFunction = (
  context: JobFunctionContext,
  args: { appName: string, partName: string }
) => JobFunctionReturn;

type DetachPartJobFunction = (
  context: JobFunctionContext,
  args: { appName: string, partName: string }
) => JobFunctionReturn;

type SetConfigJobFunction = (
  context: JobFunctionContext,
  args: { appName: string, configs: Array<Config> }
) => JobFunctionReturn;

type DeleteConfigJobFunction = (
  context: JobFunctionContext,
  args: { name: string, keys: Array<String> }
) => JobFunctionReturn;

type DeployBuildJobFunction = (
  context: JobFunctionContext,
  args: { appName: string, partName: string, version: string }
) => JobFunctionReturn;

export type WarehouseOptions = {
  isAuthorizedForAction: (req: $Request, action: Action) => boolean,
  fileDropLocation: string,
  database: DatabaseOptions,
  createApp?: CreateAppJobFunction,
  deleteApp?: DeleteAppJobFunction,
  createPart?: CreatePartJobFunction,
  deletePart?: DeletePartJobFunction,
  attachPart?: AttachPartJobFunction,
  detachPart?: DetachPartJobFunction,
  setConfig?: SetConfigJobFunction,
  deleteConfig?: DeleteConfigJobFunction,
  deployBuild?: DeployBuildJobFunction,
};

export type Context = {
  isAuthorizedForAction: (action: Action) => boolean,
  database: $Call<typeof initializeDatabase, DatabaseOptions>,
  createApp: CreateAppJobFunction,
  deleteApp: DeleteAppJobFunction,
  createPart: CreatePartJobFunction,
  deletePart: DeletePartJobFunction,
  attachPart: AttachPartJobFunction,
  detachPart: DetachPartJobFunction,
  setConfig: SetConfigJobFunction,
  deleteConfig: DeleteConfigJobFunction,
  deployBuild: DeployBuildJobFunction,
};
