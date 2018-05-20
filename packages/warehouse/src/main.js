// @flow

import 'dotenv/config';
import express from 'express';
import startWarehouse from './';
import invariant from 'invariant';
const app = express();

function isAuthorizedForAction(req, action) {
  return true;
}

function configFromEnv() {
  const fileDropLocation = process.env.WAREHOUSE_FILE_DROPLOCATION;
  invariant(typeof fileDropLocation === 'string', 'WAREHOUSE_FILE_DROPLOCATION must be set');

  const database = {
    dialect: 'mysql',
    database: process.env.WAREHOUSE_MYSQL_DATABASE || '',
    host: process.env.WAREHOUSE_MYSQL_HOST || 'localhost',
    port: process.env.WAREHOUSE_MYSQL_PORT ? parseInt(process.env.WAREHOUSE_MYSQL_PORT, 10) : 3306,
    username: process.env.WAREHOUSE_MYSQL_USER || '',
    password: process.env.WAREHOUSE_MYSQL_PASSWORD || '',
  };

  return {
    fileDropLocation,
    database,
  };
}

const config = configFromEnv();

startWarehouse(app, {
  isAuthorizedForAction,
  ...config,
});
