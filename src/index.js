const { createServer } = require('https');
const express = require('express');
const passport = require("passport");
const { Strategy } = require("passport-http-bearer");
const bodyParser = require('body-parser');
const fs = require('fs');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { subscribe, execute } = require('graphql');
const schema = require('./schema');
const { appConfig } = require('./config');
const db = require('./db');
const dev = process.env.NODE_ENV !== 'production';
const app = express();

app.tools = require('auto-load')('src/tools/auto');

app.use(bodyParser.json());

app.use('/api', graphqlExpress({ context: { db }, schema }));

app.use('/docs',
  graphiqlExpress({
    endpointURL: '/api',
    subscriptionsEndpoint: `ws://${appConfig.host}:${appConfig.port}/subscriptions`
  })
);

const server = createServer({ key: fs.readFileSync("./https/key.pem"), cert: fs.readFileSync("./https/cert.pem") }, app);

server.listen(appConfig.port, err => {
  if (err) throw err

  new SubscriptionServer(
    { schema, execute, subscribe, onConnect: () => console.log('Client connected') },
    { server, path: '/subscriptions' }
  );
  app.tools.logger.error.info(`> Ready on PORT ${appConfig.port}`)
})