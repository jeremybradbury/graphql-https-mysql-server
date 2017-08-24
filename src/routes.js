const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const schema = require('./schema');
const schemaAdmin = require('./schema-admin');
const { appConfig } = require('./config');
const express = require('express');
const admin = require('./db/admin');

module.exports = function(app, passport) {
  const TokenAuth = passport.authenticate("bearer", { session: false }); // token auth middleware
  var { tools: {log} } = app; // extract app.tools.log to log
  app.use('/private', // authenticated static resources  
    isLoggedIn, // hide scripts with ajax code
    express.static(__dirname+'/private')
  );
  app.get('/',(req,res)=>{
    if (req.isAuthenticated()) {
      res.redirect('/dash'); // users welcome
    }
    res.end(); // hide from anon
    // res.redirect('/login'); // or show them the lock
  });
  
  /* auth endpoints */
  app.post('/login', // login endpoint
    function(req, res, next) {
      passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/login'); }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.redirect(req.session.returnTo || '/dash');
        });
      })(req, res, next);
    });
  app.get('/logout',   // logout endpoint
    function(req, res) {
      req.logout();
      res.redirect('/dash');
    });
    
  /* views */
  app.get('/login',   // login view
    function(req, res) {
      res.render('login.ejs', { 
          message: req.flash('loginMessage'), 
          local: {
            url: req.url, 
            user : ''
          }
      });
    });
  app.get('/dash', // dash view
    isLoggedIn,
    function(req,res) {
      res.render('dash.ejs', { 
        local: {
          url: req.url, 
          user : req.user, 
          impersonate: false
        } 
      }); 
    });
  app.get('/dash/admin',  // admin dash view
    isLoggedIn,
    isAdmin,
    function(req,res) {
      let local = {url: req.url, user : req.user};
      app.db.User.findAll({ attributes: { exclude: ['password'] }})
        .then(users => {
          local.users = users;
          res.render('admin.ejs', {
            message: req.flash('inviteMessage'), 
            local: local
          });
        });
    }); 
  app.get('/dash/admin/user/:id', // user impersonation dash view
    isLoggedIn,
    isAdmin,
    function(req,res) {
      app.db.User.findById(req.params.id)
        .then(user => {
          res.render('dash.ejs', {local: {user: user, impersonate: req.user.email }});
        })
    });
  app.get('/new/:token', // new user/password view
    function(req, res) {
      app.db.User.findByToken(req.params.token)
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
  
  /* GraphQL endpoints/views */
  app.post('/api', // User GraphQL API endpoint
    TokenAuth, 
    graphqlExpress((req, res)=>{
      let User = req.app.db.User; // model
      let user = req.user; // self
      return { context: { req, res, User, user }, schema: schema } // user schema
    }) // restricted db context in req.app.db. pass only User from admin. user = self from auth. res for response overrides.
  );
  app.db = admin; // reassign app.db for admin operations (added security)
  app.post('/api/admin', // Admin GraphQL API endpoint
    TokenAuth, 
    isAdmin, 
    graphqlExpress((req,res)=>({context: { req, res }, schema: schemaAdmin })) // admin schema
  ); // access to req.app.[tools/db] and res
  if (process.env.NODE_ENV != 'development' && appConfig.graphqlIsAdminOnly ) { // [TODO] add to config.
    app.get('/docs',isAdmin); // admin only GraphiQL in production?
  }
  app.get('/docs', // GraphiQL view
    isLoggedIn,
    graphiqlExpress((req)=> {
      let url = req.app.url.replace('https:','wss:');
      return {
        endpointURL: '/api',
        subscriptionsEndpoint: `${url}/subscriptions`,
        passHeader: `'Authorization': 'Bearer ${req.user.token}'` // forward user's token (set by passport)
      }
    }));
  app.get('/docs/admin', // Admin GraphiQL view
    isLoggedIn, 
    isAdmin, 
    graphiqlExpress((req)=> {
      let url = req.app.url.replace('https:','wss:');
      return {
        endpointURL: '/api/admin',
        subscriptionsEndpoint: `${url}/subscriptions`,
        passHeader: `'Authorization': 'Bearer ${req.user.token}'` // forward admin's token (set by passport)
      }
    }));
    
  /* 404 everything else */
  app.use('*',(req,res)=>{ res.sendStatus(404); });  // [TODO] 404 view
}
function isLoggedIn(req, res, next) { // user auth middleware
  if (req.isAuthenticated()) return next(); // proceed to next middleware
  req.session.returnTo = req.url; // dont forget where we came
  res.redirect('/login'); // not authenticated
}
function isAdmin(req, res, next) { // admin middleware
  if(req.user.status == 'manage-users') return next(); // proceed to next middleware
  res.sendStatus(403); // not allowed
}