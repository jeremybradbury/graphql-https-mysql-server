const { createServer } = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { subscribe, execute } = require('graphql');
const schema = require('./schema');
const db = require('./db');
const app = express();

const dev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3443;

app.use(bodyParser.json());

app.use(
  '/api',
  graphqlExpress({
    context: {
      db
    },
    schema
  })
);

app.use(
  '/docs',
  graphiqlExpress({
    endpointURL: '/api',
    subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`
  })
);

const server = createServer({ key: fs.readFileSync("./https/key.pem"), cert: fs.readFileSync("./https/cert.pem") }, app);

server.listen(PORT, err => {
  if (err) throw err

  new SubscriptionServer(
    {
      schema,
      execute,
      subscribe,
      onConnect: () => console.log('Client connected')
    },
    {
      server,
      path: '/subscriptions'
    }
  )

  console.log(`> Ready on PORT ${PORT}`)
})
