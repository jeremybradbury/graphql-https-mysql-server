const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
var schema = require('./schema');
const { appConfig } = require('./config');
const express = require('express');
const admin = require('./db/admin');

module.exports = function(app, passport) {
  const TokenAuth = passport.authenticate("bearer", { session: false }); // token auth middleware
  var { db, tools: {log} } = app;
  /* static resources (icons,images,css,etc */
  app.use('/',express.static(__dirname+'/public'));
  
  /* authenticated static resources (script.js has ajax code for auth endpoints) */
  app.use('/private', isLoggedIn, express.static(__dirname+'/private'));
  
  /* auth endpoints */
  // login endpoint
  app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.redirect('/login'); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect(req.session.returnTo || '/dash');
      });
    })(req, res, next);
  });
  // logout endpoint
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/dash');
  });
    // token password reset endpoint
  app.use('/token/password',TokenAuth,function(req,res) {
    const password = app.tools.newPass();
    db.User.findById(req.user.id)
      .then(user => {
        res.json({data: {password: password}});
        user.encryptPass(password);
      })
  });
  // expire this token endpoint
  app.use('/token/expire',TokenAuth,function(req,res) {
    db.User.findById(req.user.id)
      .then(user => {
        user.tokenExpire();
      })
  });
  // renew this token endpoint
  app.use('/token/renew',TokenAuth,function(req,res) {
    db.User.findById(req.user.id)
      .then(user => {
        const data = user.tokenNew();
        res.json({data: data });
      })
  });
  // user auth token renew endpoint
  app.use('/user/token',isLoggedIn,function(req,res) { 
    db.User.findById(req.user.id)
      .then(user => {
        const data = user.tokenNew();
        res.json({data: data});
      })
  });
  // get user with auth token endpoint
  app.use('/user/getToken',isLoggedIn,function(req,res) { 
    db.User.findById(req.user.id)
      .then(user => {
        const data = { token: user.token, expires: user.expires };
        res.json({data: data});
      })
  });
  // admin get token by id
  app.post('/user/getTokenById',isLoggedIn,isAdmin,function(req,res,next) {
    if(req.user.status == 'manage-users') {
      db.User.findById(req.body.id)
        .then(user => {
          if(user){
           const data = { token: user.token, expires: user.expires };
           res.json({data: data}); 
          } else {
            next();
          }
        })
    }
  });
  // admin renew token by id
  app.post('/user/renewTokenById',isLoggedIn,isAdmin,function(req,res,next) {
    if(req.user.status == 'manage-users') {
      db.User.findById(req.body.id)
        .then(user => {
          if(user){
            res.json({data: user.tokenNew()}); 
          } else {
            next();
          }
        })
    }
  });
  
  /* views */
  // login view
  app.get('/login', function(req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage'), local: {url: req.url, user : ''} }); 
  });
  // dash view
  app.get('/dash',isLoggedIn,function(req,res) {
    res.render('dash.ejs', { local: {url: req.url, user : req.user, impersonate: false} }); 
  });
  // admin dash view
  app.get('/dash/admin',isLoggedIn,isAdmin,function(req,res) {
    let local = {url: req.url, user : req.user};
    db.User.findAll({ attributes: { exclude: ['password'] }})
      .then(users=>{
        local.users = users;
        res.render('admin.ejs', {message: req.flash('inviteMessage'), local: local});
      })
  });
  // admin user update endpoint
  app.post('/dash/admin',isLoggedIn,isAdmin,function(req,res,next) {
    if(req.body.expires) { // expire post
      db.User.findById(req.body.id)
        .then(user => {
          user.tokenExpire();
          res.redirect('/dash/admin');
        })
    } else {
      if(req.body.id) { // status post
      db.User.findById(req.body.id)
        .then(user => {
          if(req.body.status){
            log.e.info(user.email + ' changed to ' + req.body.status);
            user.enable(req.body.status);
          } else {
            log.e.info(user.email + ' disabled');
            user.disable();
          }
          res.redirect('/dash/admin');
        })
      }
      if(req.body.email) { // invite post
        db.User.findOrCreate({where: {email: req.body.email}})
          .spread((user,created) => {
            let message;
            if(created) {
              message = `New user: ${req.body.email} has been created. <br>Please provide user with this link to set a password: ${appConfig.url}:${appConfig.port}/new/${user.token} <br>Note: this link expires in 24 hours. It has NOT been sent to the user (emails is not setup).`;
            } else { // user exists
              if(!user.password){
                token = user.tokenNew(1);
                message = `User ${req.body.email} exists. <br>Please provide user with this new link to set a password: ${appConfig.url}:${appConfig.port}/new/${token.token} <br>Note: this link expires in 24 hours. It has NOT been sent to the user (emails is not setup).`;
              } else {
                message = 'User has set a password already.';
              }
            }
            req.flash('inviteMessage', message);
            res.redirect('/dash/admin');
          });
      }
    }
  });
  // user impersonation dash view
  app.get('/dash/admin/user/:id',isLoggedIn,isAdmin,function(req,res) {
    db.User.findById(req.params.id)
      .then(user=>{
        res.render('dash.ejs', {local: {user: user, impersonate: req.user.email }});
      })
  });
  // new user/password view
  app.get('/new/:token', function(req, res) {
    db.User.findByToken(req.params.token)
      .then(user => {
        if(user instanceof Error || !user.status) { // valid user without a flasey status
          res.sendStatus(401);
        } else {
          if(!user.password) { // empty password == new user
            res.render('new.ejs', {local: { user: user }});
          } else {
            res.redirect('/dash'); // password is already set, go login fool (or home if you are logged in)
          }
        }
      })
  });

  // User GraphQL API
  app.post('/api', TokenAuth, graphqlExpress({ context: { db }, schema })); // only allow posts
  // Admin GraphQL API
  db = admin; // what var is for: need the same variable name, different values
  schema = require('./schema-admin'); // what var is for: need the same variable name, different values
  app.post('/api/admin', TokenAuth, isAdmin, graphqlExpress({ context: { db }, schema })); // only allow posts
  // GraphiQL - needs token AND login session
  app.get('/docs', isLoggedIn, graphiqlExpress({
    endpointURL: '/api',
    subscriptionsEndpoint: `wss://${appConfig.host}:${appConfig.port}/subscriptions`
  }));
  // GraphiQL - needs token AND login session
  app.get('/docs/admin', isLoggedIn, isAdmin, graphiqlExpress({
    endpointURL: '/api/admin',
    subscriptionsEndpoint: `wss://${appConfig.host}:${appConfig.port}/subscriptions`
  }));
  // 404 everything else [note: one too many next() will end here rather than 'Cannot GET...']
    // TODO: 404 view
  app.use('*',(req,res)=>{ res.sendStatus(404); });
}
// user auth middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // proceed to next middleware
  }
  // not authenticated
  req.session.returnTo = req.url;
  res.redirect('/login');
}
// admin middleware
function isAdmin(req, res, next) {
  if(req.user.status == 'manage-users') {
    return next(); // proceed to next middleware
  }
  // not allowed
  res.sendStatus(403);
}