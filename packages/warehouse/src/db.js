// @flow

import Sequelize from 'sequelize';
import type { DatabaseOptions } from './types';

export default function initializeDatabase(options: DatabaseOptions) {
  const args =
    options.dialect === 'mysql' ? [options.database, options.username, options.password] : [];

  const sequalizeOptions =
    options.dialect === 'mysql'
      ? {
          host: options.host,
          port: options.port,
        }
      : {
          storage: options.storage,
        };

  const sequelize = new Sequelize(...args, {
    dialect: options.dialect,
    ...sequalizeOptions,
    logging: false,
    operatorsAliases: {},
  });

  const App = sequelize.define('app', {
    name: { type: Sequelize.STRING, primaryKey: true },
  });

  const Part = sequelize.define('part', {
    name: { type: Sequelize.STRING, primaryKey: true },
  });
  App.Parts = App.belongsToMany(Part, { through: 'appPart' });
  Part.Apps = Part.belongsToMany(App, { through: 'appPart' });

  const Config = sequelize.define('config', {
    key: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    value: Sequelize.STRING,
  });
  Config.belongsTo(App, {
    onDelete: 'CASCADE',
    foreignKey: {
      primaryKey: true,
      allowNull: false,
    },
  });

  const Job = sequelize.define('job', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: Sequelize.ENUM,
      values: ['Running', 'Completed', 'Failed'],
    },
  });

  const JobMessage = sequelize.define('jobMessage', {
    message: Sequelize.STRING,
  });
  JobMessage.belongsTo(Job, {
    onDelete: 'CASCADE',
  });

  const Build = sequelize.define('build', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    version: Sequelize.STRING,
    tarballUrl: Sequelize.STRING,
    url: Sequelize.STRING,
    config: Sequelize.STRING,
  });

  Build.belongsTo(App, {
    onDelete: 'CASCADE',
  });
  Build.belongsTo(Part, {
    onDelete: 'CASCADE',
  });

  const Deployment = sequelize.define('deployment', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  });
  Deployment.belongsTo(Build);

  async function connect() {
    await sequelize.sync({ logging: false });
  }

  async function close() {
    await sequelize.close();
  }

  return {
    App,
    Part,
    Config,
    Build,
    Job,
    JobMessage,
    Deployment,
    connect,
    close,
  };
}
