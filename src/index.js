'use strict';
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const passport = require("passport");
const helmet = require('helmet');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const { json, urlencoded  } = require('body-parser');
const { createServer } = require('https');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { subscribe, execute } = require('graphql');
const { appConfig } = require('./config');
const schema = require('./schema');
const db = require('./db');
const key = fs.readFileSync("./https/key.pem");
const cert = fs.readFileSync("./https/cert.pem");
const app = express();

// middleware
require('./config/passport')(passport);
app.set('view engine', 'ejs');
app.use(session({
  secret: appConfig.secret,
  cookie: { secure: true }, 
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize()); 
app.use(passport.session());
app.use(helmet());
app.tools = require('auto-load')('src/tools');
app.db = db;
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(app.tools.log.access("combined",{stream: app.tools.log.aStream})); // add morgan
app.use(flash());
//app.disable('view cache');

// routes
require('./routes')(app, passport); 

const server = createServer({ key: key, cert: cert }, app);
server.listen(appConfig.port, err => {
  if (err) throw err

  new SubscriptionServer(
    { schema, execute, subscribe, onConnect: () => app.tools.log.e.debug('Client connected') },
    { server, path: '/subscriptions' }
  );
  // TODO: admin subscription server
  app.tools.log.e.info(`Listening on ${appConfig.host}:${appConfig.port}`);
})