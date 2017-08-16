const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const schema = require('./schema');
const { appConfig } = require('./config');
const express = require('express');

module.exports = function(app, passport) {
  const TokenAuth = passport.authenticate("bearer", { session: false }); // token auth middleware
  const { db, tools: {log} } = app;
  // dashboard routes
  app.use('/',express.static(__dirname+'/public')); 
  app.get('/login', function(req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') }); 
  });
  app.get('/dash', isLoggedIn, function(req,res) {
    res.render('dash.ejs', { user : req.user }); 
  });
  app.post('/login', passport.authenticate('local', {
      successRedirect : '/dash',
      failureRedirect : '/login', 
      failureFlash : true
    })
  );
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/dash');
  });
  app.get('/begin/:token', function(req, res) {
    db.User.findByToken(req.params.token)
      .then(user => {
        if(user instanceof Error || !user.status) { // valid user without a flasey status
          res.sendStatus(401);
        } else {
          if(!user.password) { // empty password == new user
            res.render('begin.ejs', { user : user });
          } else {
            res.redirect('/dash'); // password is already set, go login fool (or home if you are logged in)
          }
        }
      })
      .catch(e => {
        log.e.error(e);
      })
  });
  // token auth routes
  app.use('/token/password',TokenAuth,function(req,res) {
    const password = app.tools.newPass();
    db.User.findById(req.user.id)
      .then(user => {
        res.json({data: {password: password}});
        user.encryptPass(password);
      })
      .catch(e => {
        log.e.error(e);
      });
  });
  app.use('/token/check',TokenAuth,function(req,res) {
    db.User.findById(req.user.id)
      .then(user => {
        if(user) res.sendStatus(200);
        else res.sendStatus(401);
      })
      .catch(e => {
        log.e.error(e);
      });
  });
  app.use('/token/expire',TokenAuth,function(req,res) {
    db.User.findById(req.user.id)
      .then(user => {
        user.tokenExpire();
      })
      .catch(e => {
        log.e.error(e);
      });
  });
  app.use('/token/renew',TokenAuth,function(req,res) {
    db.User.findById(req.user.id)
      .then(user => {
        const data = user.tokenNew();
        res.json({data: data });
      })
      .catch(e => {
        log.e.error(e);
      });
  });
  
  // user auth routes
  app.use('/user/auth',function(req,res) { 
    let User = req.get('Authorization').split(':'); // TODO: grab from post body
    db.User.check(User[0],User[1])
      .then(user => {
        if(user) res.sendStatus(200);
        else res.sendStatus(401);
      })
      .catch(e => {
        log.e.error(e);
      });
  });
  app.use('/user/token',isLoggedIn,function(req,res) { 
    db.User.findById(req.user.id)
      .then(user => {
        const data = user.tokenNew();
        res.json({data: data});
      })
      .catch(e => {
        log.e.error(e);
      });
  });
  app.use('/user/getToken',isLoggedIn,function(req,res) { 
    db.User.findById(req.user.id)
      .then(user => {
        const data = { token: user.token, expires: user.expires };
        res.json({data: data});
      })
      .catch(e => {
        log.e.error(e);
      });
  });
  
  // GraphQL API routes
  app.post('/api', TokenAuth, graphqlExpress({ context: { db }, schema })); // only allow posts
  app.get('/docs', isLoggedIn, graphiqlExpress({
    endpointURL: '/api',
    subscriptionsEndpoint: `wss://${appConfig.host}:${appConfig.port}/subscriptions`
  }));
  app.use('*',TokenAuth,(req,res)=>{ res.sendStatus(404); }); // 404 everything else (if token used, otherwise 401)
}

// user auth middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.returnTo = req.url;
  res.redirect('/login');
}