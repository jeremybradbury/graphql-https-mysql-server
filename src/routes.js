const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const schema = require('./schema');
const { appConfig } = require('./config');
const express = require('express');

module.exports = function(app, passport) {
  const TokenAuth = passport.authenticate("bearer", { session: false }); // token auth middleware
  const { db, tools: {log} } = app;
  // static resources (icons,images,css,etc)
  app.use('/',express.static(__dirname+'/public'));
  // logged in only static resources (script.js has ajax code for auth endpoints)
  app.use('/private', isLoggedIn, express.static(__dirname+'/private'));
  // user auth view
  app.get('/login', function(req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage'), local: {url: req.url, user : ''} }); 
  });
  // login endpoint
  app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      // Redirect if it fails
      if (!user) { return res.redirect('/login'); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        // Redirect if it succeeds
        return res.redirect(req.session.returnTo || '/dash');
      });
    })(req, res, next);
  });
  // logout endpoint
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/dash');
  });
  // dash view
  app.get('/dash', isLoggedIn, function(req,res) {
    res.render('dash.ejs', { local: {url: req.url, user : req.user, impersonate: false} }); 
  });
  // admin dash view
  app.get('/dash/admin', isLoggedIn, function(req,res) {
    if(req.user.status == 'manage-users') { // isAdmin()
      let local = {url: req.url, user : req.user};
      db.User.findAll({ attributes: { exclude: ['password'] }})
        .then(users=>{
          local.users = users;
          res.render('admin.ejs', {message: req.flash('inviteMessage'), local: local});
        })
    }
  });
  // admin user update endpoint
  app.post('/dash/admin', isLoggedIn, function(req,res,next) {
    if(req.user.status == 'manage-users') { // isAdmin()
      if(req.body.id) {
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
      if(req.body.email) {
        db.User.create({email: req.body.email})
          .then(user => {
            let message = `New user: ${req.body.email} has been created. <br>Please provide user with this link to set a password: ${appConfig.url}:${appConfig.port}/new/${user.token} <br>Note: this link expires in 24 hours. It has NOT been sent to the user (emails is not setup).`;
            req.flash('inviteMessage', message);
            res.redirect('/dash/admin');
          })
      }
    } else {
      next();
    }
  });
  // user impersonation dash view
  app.get('/dash/admin/user/:id', isLoggedIn, function(req,res) {
    if(req.user.status == 'manage-users') { // isAdmin()
      db.User.findById(req.params.id)
        .then(user=>{
          res.render('dash.ejs', {local: {user: user, impersonate: req.user.email }});
        })
    }
  });
  // new user/password view
  app.get('/new/:token', function(req, res) {
    db.User.findByToken(req.params.token)
      .then(user => {
        if(user instanceof Error || !user.status) { // valid user without a flasey status
          res.sendStatus(401);
        } else {
          if(!user.password) { // empty password == new user
            res.render('new.ejs', {local: { user : user }});
          } else {
            res.redirect('/dash'); // password is already set, go login fool (or home if you are logged in)
          }
        }
      })
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
  // get user from auth token endpoint
  app.use('/token/check',TokenAuth,function(req,res) {
    db.User.findById(req.user.id)
      .then(user => {
        if(user) res.sendStatus(200);
        else res.sendStatus(401);
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
  // GraphQL API
  app.post('/api', TokenAuth, graphqlExpress({ context: { db }, schema })); // only allow posts
  // GraphiQL - needs token AND login session
  app.get('/docs', isLoggedIn, graphiqlExpress({
    endpointURL: '/api',
    subscriptionsEndpoint: `wss://${appConfig.host}:${appConfig.port}/subscriptions`
  }));
  // 404 everything else
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