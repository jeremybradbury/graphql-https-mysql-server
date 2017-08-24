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
require('./config/passport')(passport);
app.url = (process.env.NODE_ENV == 'development') ? `${appConfig.url}:${appConfig.port}` : `${appConfig.url}`;
const { log } = app.tools = require('auto-load')('src/tools');
app.db = db;

// middleware
app.use(helmet());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser(appConfig.secret));
app.use(log.access("combined",{stream: log.aStream})); // add morgan
app.use(flash());
app.use('/', // sessionless static resources (icons,images,css,etc)
  express.static(__dirname+'/public')
);
app.use(session({
  secret: appConfig.secret,
  cookie: { secure: true, sameSite: true, maxAge: 604800000/7 }, // 7 days note: (maxAge/7) = 1 day, (maxAge*4) = 28 days
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.enable('trust proxy');
app.set('view engine', 'ejs');
//app.disable('view cache');

// routes
require('./routes')(app, passport); 

const server = createServer({ key: key, cert: cert }, app);
server.listen(appConfig.port, err => {
  if (err) throw err

  new SubscriptionServer(
    { schema, execute, subscribe, onConnect: () => log.e.debug('Client connected') },
    { server, path: '/subscriptions' }
  );
  // TODO: admin subscription server
  log.e.info(`Listening on ${app.url}`);
})