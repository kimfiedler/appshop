// @flow

import { createContext, query, queryAndCompleteJob } from './utils';

test('create app with configs', async () => {
  const context = await createContext();

  await queryAndCompleteJob(
    `mutation {
      createApp(name: "myapp", configs: [{ key: "key1", value: "value1" }]) {
        id
        status
      }
    }`,
    context,
    'createApp'
  );

  const queryAllApps = await query(
    `{
    apps {
      name
      configs {
        key
        value
      }
    }
  }`,
    context
  );

  expect(queryAllApps).toMatchObject({
    data: {
      apps: [
        {
          name: 'myapp',
          configs: [{ key: 'key1', value: 'value1' }],
        },
      ],
    },
  });

  const querySpecificApp = await query(
    `{
      app(name: "myapp") {
        name
        configs {
          key
          value
        }
      }
    }`,
    context
  );

  expect(querySpecificApp).toMatchObject({
    data: {
      app: {
        name: 'myapp',
        configs: [{ key: 'key1', value: 'value1' }],
      },
    },
  });
});

test('create a part and attach it to app', async () => {
  const context = await createContext();

  await queryAndCompleteJob(
    `mutation {
      createApp(name: "myapp", configs: [{ key: "key1", value: "value1" }]) {
        id
        status
      }
    }`,
    context,
    'createApp'
  );

  await queryAndCompleteJob(
    `mutation {
      createPart(name: "mypart", apps: [ "myapp" ]) {
        id
        status
      }
    }`,
    context,
    'createPart'
  );

  const queryAllParts = await query(
    `{
      parts {
        name
        apps {
          name
        }
      }
    }`,
    context
  );

  expect(queryAllParts).toMatchObject({
    data: {
      parts: [
        {
          name: 'mypart',
          apps: [{ name: 'myapp' }],
        },
      ],
    },
  });

  const querySpecificPart = await query(
    `{
      part(name: "mypart") {
        name
        apps {
          name
        }
      }
    }`,
    context
  );

  expect(querySpecificPart).toMatchObject({
    data: {
      part: {
        name: 'mypart',
        apps: [{ name: 'myapp' }],
      },
    },
  });

  const querySpecificApp = await query(
    `{
      app(name: "myapp") {
        name
        parts {
          name
        }
      }
    }`,
    context
  );

  expect(querySpecificApp).toMatchObject({
    data: {
      app: {
        name: 'myapp',
        parts: [{ name: 'mypart' }],
      },
    },
  });
});

test('detach and attach part', async () => {
  const context = await createContext();

  await queryAndCompleteJob(
    `mutation {
      createApp(name: "myapp", configs: [{ key: "key1", value: "value1" }]) {
        id
        status
      }
    }`,
    context,
    'createApp'
  );

  await queryAndCompleteJob(
    `mutation {
      createPart(name: "mypart", apps: [ "myapp" ]) {
        id
        status
      }
    }`,
    context,
    'createPart'
  );

  const partQuery = `
  {
    part(name: "mypart") {
      name
      apps {
        name
      }
    }
  } 
  `;

  const querySpecificPart = await query(partQuery, context);

  expect(querySpecificPart).toMatchObject({
    data: {
      part: {
        name: 'mypart',
        apps: [{ name: 'myapp' }],
      },
    },
  });

  await queryAndCompleteJob(
    `mutation {
      detachPartFromApp(partName: "mypart", appName: "myapp") {
        id
        status
      }
    }`,
    context,
    'detachPartFromApp'
  );

  const querySpecificPart2 = await query(partQuery, context);

  expect(querySpecificPart2).toMatchObject({
    data: {
      part: {
        name: 'mypart',
        apps: [],
      },
    },
  });

  await queryAndCompleteJob(
    `mutation {
      attachPartToApp(partName: "mypart", appName: "myapp") {
        id
        status
      }
    }`,
    context,
    'attachPartToApp'
  );

  const querySpecificPart3 = await query(partQuery, context);

  expect(querySpecificPart3).toMatchObject({
    data: {
      part: {
        name: 'mypart',
        apps: [{ name: 'myapp' }],
      },
    },
  });
});

test('set config', async () => {
  const context = await createContext();

  await queryAndCompleteJob(
    `mutation {
      createApp(name: "myapp", configs: [{ key: "key1", value: "value1" }]) {
        id
        status
      }
    }`,
    context,
    'createApp'
  );

  await queryAndCompleteJob(
    `mutation {
      createApp(name: "myotherapp", configs: [{ key: "key1", value: "value1" }]) {
        id
        status
      }
    }`,
    context,
    'createApp'
  );

  const appQuery = `{
    app(name: "myapp") {
      name
      configs {
        key
        value
      }
    }
  }`;

  const querySpecificApp = await query(appQuery, context);

  expect(querySpecificApp).toMatchObject({
    data: {
      app: {
        name: 'myapp',
        configs: [{ key: 'key1', value: 'value1' }],
      },
    },
  });

  await queryAndCompleteJob(
    `mutation {
      setAppConfig(appName: "myapp", configs: [ { key: "k1", value: "v1" }, { key: "k2", value: "v2" }, { key: "key1", value: "newvalue"} ]) {
        id
        status
      }
    }`,
    context,
    'setAppConfig'
  );

  const querySpecificApp2 = await query(appQuery, context);

  expect(querySpecificApp2).toMatchObject({
    data: {
      app: {
        name: 'myapp',
        configs: [
          { key: 'key1', value: 'newvalue' },
          { key: 'k1', value: 'v1' },
          { key: 'k2', value: 'v2' },
        ],
      },
    },
  });
});

test('delete config', async () => {
  const context = await createContext();

  await queryAndCompleteJob(
    `mutation {
      createApp(name: "myapp", configs: [{ key: "key1", value: "value1" }]) {
        id
        status
      }
    }`,
    context,
    'createApp'
  );

  const appQuery = `{
    app(name: "myapp") {
      name
      configs {
        key
        value
      }
    }
  }`;

  const querySpecificApp = await query(appQuery, context);

  expect(querySpecificApp).toMatchObject({
    data: {
      app: {
        name: 'myapp',
        configs: [{ key: 'key1', value: 'value1' }],
      },
    },
  });

  await queryAndCompleteJob(
    `mutation {
      deleteAppConfig(appName: "myapp", configs: [ { key: "key1" } ]) {
        id
        status
      }
    }`,
    context,
    'deleteAppConfig'
  );

  const querySpecificApp2 = await query(appQuery, context);

  expect(querySpecificApp2).toMatchObject({
    data: {
      app: {
        name: 'myapp',
        configs: [],
      },
    },
  });
});

test('create and delete app', async () => {
  const context = await createContext();

  await queryAndCompleteJob(
    `mutation {
      createApp(name: "myapp", configs: [{ key: "key1", value: "value1" }]) {
        id
        status
      }
    }`,
    context,
    'createApp'
  );

  const allAppsQuery = `{
    apps {
      name
      configs {
        key
        value
      }
    }
  }`;

  const queryAllApps = await query(allAppsQuery, context);

  expect(queryAllApps).toMatchObject({
    data: {
      apps: [
        {
          name: 'myapp',
          configs: [{ key: 'key1', value: 'value1' }],
        },
      ],
    },
  });

  await queryAndCompleteJob(
    `mutation {
      deleteApp(name: "myapp") {
        id
        status
      }
    }`,
    context,
    'deleteApp'
  );

  const queryAllApps2 = await query(allAppsQuery, context);

  expect(queryAllApps2).toMatchObject({
    data: {
      apps: [],
    },
  });
});

test('create and delete part', async () => {
  const context = await createContext();

  await queryAndCompleteJob(
    `mutation {
      createPart(name: "anotherpart", apps: []) {
        id
        status
      }
    }`,
    context,
    'createPart'
  );

  const allPartsQuery = `{
    parts {
      name
    }
  }`;

  const queryAllParts = await query(allPartsQuery, context);

  expect(queryAllParts).toMatchObject({
    data: {
      parts: [
        {
          name: 'anotherpart',
        },
      ],
    },
  });

  await queryAndCompleteJob(
    `mutation {
      deletePart(name: "anotherpart") {
        id
        status
      }
    }`,
    context,
    'deletePart'
  );

  const queryAllParts2 = await query(allPartsQuery, context);

  expect(queryAllParts2).toMatchObject({
    data: {
      parts: [],
    },
  });
});

test('create and query build', async () => {
  const context = await createContext();

  await queryAndCompleteJob(
    `mutation {
      createApp(name: "myapp", configs: [{ key: "key1", value: "value1" }]) {
        id
        status
      }
    }`,
    context,
    'createApp'
  );

  await queryAndCompleteJob(
    `mutation {
      createPart(name: "mypart", apps: [ "myapp" ]) {
        id
        status
      }
    }`,
    context,
    'createPart'
  );

  await queryAndCompleteJob(
    `mutation {
      createBuild(
        appName: "myapp",
        partName: "mypart",
        version: "1",
        tarballUrl: "https:/some.where/pkg.tar.gz",
        url: "https://some.where/pkg/",
        config: "{'key1': 'value1'}"
      ) {
        id
        status
      }
    }`,
    context,
    'createBuild'
  );

  const queryBuild = await query(
    `{
    part(name: "mypart") {
      name
      builds {
        app {
          name
        }
        part {
          name
        }
        version,
        tarballUrl,
        url,
        config
      }
    }
  }`,
    context
  );

  expect(queryBuild).toMatchObject({
    data: {
      part: {
        name: 'mypart',
        builds: [
          {
            app: {
              name: 'myapp',
            },
            part: {
              name: 'mypart',
            },
            version: '1',
            tarballUrl: 'https:/some.where/pkg.tar.gz',
            url: 'https://some.where/pkg/',
            config: "{'key1': 'value1'}",
          },
        ],
      },
    },
  });
});

test('create build and deploy', async () => {
  const context = await createContext();

  await queryAndCompleteJob(
    `mutation {
      createApp(name: "myapp", configs: [{ key: "key1", value: "value1" }]) {
        id
        status
      }
    }`,
    context,
    'createApp'
  );

  await queryAndCompleteJob(
    `mutation {
      createPart(name: "mypart", apps: [ "myapp" ]) {
        id
        status
      }
    }`,
    context,
    'createPart'
  );

  await queryAndCompleteJob(
    `mutation {
      createBuild(
        appName: "myapp",
        partName: "mypart",
        version: "1",
        tarballUrl: "https:/some.where/pkg.tar.gz",
        url: "https://some.where/pkg/",
        config: "{'key1': 'value1'}"
      ) {
        id
        status
      }
    }`,
    context,
    'createBuild'
  );

  await queryAndCompleteJob(
    `mutation {
      deployBuild(
        appName: "myapp",
        partName: "mypart",
        version: "1",
      ) {
        id
        status
      }
    }`,
    context,
    'deployBuild'
  );

  await queryAndCompleteJob(
    `mutation {
      createBuild(
        appName: "myapp",
        partName: "mypart",
        version: "2",
        tarballUrl: "https:/some.where/pkg.tar.gz",
        url: "https://some.where/pkg/",
        config: "{'key1': 'value1'}"
      ) {
        id
        status
      }
    }`,
    context,
    'createBuild'
  );

  await queryAndCompleteJob(
    `mutation {
      deployBuild(
        appName: "myapp",
        partName: "mypart",
        version: "2",
      ) {
        id
        status
      }
    }`,
    context,
    'deployBuild'
  );

  const queryDeployments = await query(
    `{
    app(name: "myapp") {
      currentDeployments {
        build {
          app {
            name
          }
          part {
            name
          }
          version
        }
      }
    }
  }`,
    context
  );

  expect(queryDeployments).toMatchObject({
    data: {
      app: {
        currentDeployments: [
          {
            build: {
              app: {
                name: 'myapp',
              },
              part: {
                name: 'mypart',
              },
              version: '2',
            },
          },
        ],
      },
    },
  });
});
