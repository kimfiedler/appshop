import { gql } from 'apollo-server';
import {
  appResolvers,
  jobResolvers,
  configResolvers,
  partResolvers,
  buildResolvers,
  deploymentResolvers,
} from './resolvers';

export const typeDefs = gql`
  type App {
    name: String!
    parts: [Part!]!
    configs: [Config!]!
    currentDeployments: [Deployment!]!
  }

  type Part {
    name: String!
    apps: [App!]!
    builds: [Build!]!
  }

  type Config {
    key: String!
    value: String!
  }

  type Build {
    id: ID!
    version: String!
    tarballUrl: String
    url: String
    config: String!
    app: App!
    part: Part!
  }

  type Query {
    app(name: String!): App
    part(name: String!): Part
    parts: [Part]
    apps: [App]
    jobDetailsAfterMessageId(id: ID!, messageId: ID!): Job
  }

  input ConfigInput {
    key: String!
    value: String!
  }

  input ConfigDeleteInput {
    key: String!
  }

  enum JobStatus {
    Running
    Completed
    Failed
  }

  type JobMessage {
    createdAt: String!
    id: ID!
    message: String!
  }

  type Job {
    id: ID!
    status: JobStatus
    createdAt: String!
    messages: [JobMessage!]!
  }

  type Deployment {
    id: ID!
    build: Build!
    createdAt: String!
  }

  type Mutation {
    createApp(name: String!, configs: [ConfigInput!]): Job
    deleteApp(name: String!): Job
    setAppConfig(appName: String!, configs: [ConfigInput!]): Job
    deleteAppConfig(appName: String!, configs: [ConfigDeleteInput!]): Job
    attachPartToApp(partName: String!, appName: String!): Job
    detachPartFromApp(partName: String!, appName: String!): Job

    createPart(name: String!, apps: [String!]): Job
    deletePart(name: String!): Job

    createBuild(
      appName: String!
      partName: String!
      version: String!
      config: String!
      url: String
      tarballUrl: String
    ): Job

    deployBuild(appName: String!, partName: String!, version: String!): Job
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

export const resolvers = {
  Query: {
    app: appResolvers.appByName,
    part: partResolvers.partByName,
    apps: appResolvers.allApps,
    parts: partResolvers.allParts,
    jobDetailsAfterMessageId: jobResolvers.jobDetails,
  },
  App: {
    parts: partResolvers.partsByApp,
    configs: configResolvers.configsByApp,
    currentDeployments: deploymentResolvers.currentDeploymentsByApp,
  },
  Part: {
    apps: appResolvers.appsByPart,
    builds: buildResolvers.buildsByPart,
  },
  Build: {
    app: appResolvers.appByBuild,
    part: partResolvers.partByBuild,
  },
  Mutation: {
    createApp: appResolvers.createApp,
    deleteApp: appResolvers.deleteApp,
    setAppConfig: configResolvers.setAppConfig,
    deleteAppConfig: configResolvers.deleteAppConfig,
    createPart: partResolvers.createPart,
    deletePart: partResolvers.deletePart,
    attachPartToApp: partResolvers.attachPartToApp,
    detachPartFromApp: partResolvers.detachPartFromApp,
    createBuild: buildResolvers.createBuild,
    deployBuild: deploymentResolvers.deployBuild,
  },
};
