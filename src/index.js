'use strict';
const fs = require('fs');
const express = require('express');
const passport = require("passport");
const helmet = require('helmet');
const flash = require('connect-flash');
const { json, urlencoded  } = require('body-parser');
const { createServer } = require('https');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { subscribe, execute } = require('graphql');
const { appConfig, dbConfig } = require('./config');
const schema = require('./schema');
const db = require('./db');
const key = fs.readFileSync("./https/key.pem");
const cert = fs.readFileSync("./https/cert.pem");
const app = express();
app.url = (process.env.NODE_ENV == 'development') ? `${appConfig.url}:${appConfig.port}` : `${appConfig.url}`;
app.url = (process.env.API_URL) ? process.env.API_URL : app.url;
const { log } = app.tools = require('auto-load')('src/tools');
app.db = db;

// destroy existing sessions on deploy/restart
db.Sessions.sync({force: true}).then(()=>log.e.debug('Cleaned sessions'));

// configure
require('./config/passport')(passport);
app.use(helmet());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(log.access("combined",{stream: log.aStream})); // add morgan
app.use(flash());
app.set('trust proxy',1);
app.set('view engine', 'ejs');
app.set('views','./src/views');
//app.disable('view cache'); // not recommended

// routes
require('./routes')(app, passport); 

const server = createServer({ key: key, cert: cert }, app);
server.listen(appConfig.port, err => {
  if (err) throw err;
  new SubscriptionServer(
    { schema, execute, subscribe, onConnect: () => log.e.debug('Client connected') },
    { server, path: '/subscriptions' }
  );
  // TODO: admin subscription server
  log.e.info(`Listening on ${app.url}`);
})