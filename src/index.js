'use strict';
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const Store = require('express-session-sequelize')(session.Store);
const passport = require("passport");
const helmet = require('helmet');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
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
db.Sessions.sync({force: true})
  .then(()=>{log.e.info('Cleaned sessions'); return null;});

// configure
require('./config/passport')(passport);
app.use(helmet());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(log.access("combined",{stream: log.aStream})); // add morgan
app.use('/', // sessionless static resources (icons,images,css,etc)
  express.static(__dirname+'/public')
);
app.use(flash());
app.use(cookieParser(appConfig.secret));
const store = new Store({ db: db.sequelize, checkExpirationInterval: 300000, expires: 900000 }); // cleanup every 5m, logout if inactive 15m
app.use(session({
  key: 'sid',
  secret: appConfig.secret,
  store: store,
  cookie: { secure: true, sameSite: true, maxAge: 604800000/7 }, // 7days/7 = 24 hours; 7days*4 = 28 days
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
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