const express = require('express');
const { User, GraphQL } = require('./controllers'); 
const { appConfig } = require('./config');
const session = require('express-session');
const Store = require('connect-session-sequelize')(session.Store);
const cookieParser = require('cookie-parser');

module.exports = function(app, passport) {  
  /* middleware */
  hasValidToken = passport.authenticate("bearer", { session: false }); // token auth middleware pure sessionless
  hasTokenOrSession = function(req,res,next) { // less secure
    if (req.isAuthenticated()) { return next(); } // valid login session OR...
    return passport.authenticate("bearer", { session: false })(req,res,next); // token auth middleware
  }
  isLoggedIn = function (req, res, next) { // user auth middleware
    if (req.isAuthenticated()) return next(); // proceed to next middleware
    req.session.returnTo = req.url; // dont forget where we came
    res.redirect('/login'); // not authenticated
  };
  isAdmin = function (req, res, next) { // admin middleware
    if(req.user.status == 'manage-users') return next(); // proceed to next middleware
    res.sendStatus(403); // not allowed
  }
  
  /* sessionless routes */
  app.use('/', // icons,images,css,etc
    express.static(__dirname+'/public')
  );
  // CORS for APIs
  app.use(['/api','/api/admin'], 
    function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      res.header("Access-Control-Allow-Method", "POST");
      next();
    });
  app.post('/api', hasValidToken, GraphQL.api); // User GraphQL API endpoint
  app.post('/api/admin', hasValidToken, isAdmin, GraphQL.admin.api); // Admin GraphQL API endpoint
  
  /* sessions for routes below */
  const expires = new Date();
  expires.setDate(expires.getDate() + 1); // 24 hour expiry
  function extendDefaultFields(defaults, session) {
    let userId = (session.passport) ? session.passport.user : null;
    return {
      data: defaults.data,
      expires: defaults.expires,
      userId: userId
    };
  }
  app.use(session({ 
    key: 'sid',
    secret: appConfig.secret,
    store: new Store({ 
      db: app.db.sequelize,
      table: 'session',
      extendDefaultFields: extendDefaultFields,
    }),
    cookie: { secure: true, sameSite: true, expires: expires},
    resave: false,
    saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cookieParser(appConfig.secret));
  
  /* sessioned static resources */
  app.use('/private',
    isLoggedIn, // authenticated static resources
    express.static(__dirname+'/private')
  );
  
  /* sessioned endpoints */
  app.post('/login', (req, res, next) => { // login endpoint
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.redirect('/login'); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect(req.session.returnTo || '/dash');
      });
    })(req, res, next);
  });
  app.get('/password-reset', hasTokenOrSession, User.resetMyPassword);
  app.get('/token', hasTokenOrSession, User.getMyToken);
  app.get('/token/renew', hasTokenOrSession, User.renewMyToken);
  
  /* sessioned views */
  app.get('/', User.views.homeHide); // hidden home. what? it's an API
  app.get('/logout', User.logout );// logout
  app.get('/login', User.views.login); // login view
  app.get('/dash', isLoggedIn, User.views.dash); // dash view
  app.get('/admin/users/recover', isLoggedIn, isAdmin, User.admin.views.recover); // recover delted users view
  app.get('/admin/users/recover/1', User.admin.views.recover1); // dont use page 1
  app.get('/admin/users/recover/:page', isLoggedIn, isAdmin, User.admin.views.recoverPaged); // recover delted users pagination
  app.get('/admin/users', isLoggedIn, isAdmin, User.admin.views.dash); // admin dash view
  app.get('/admin/users/1', User.admin.views.dash1); // dont use page 1
  app.get('/admin/users/:page', isLoggedIn, isAdmin, User.admin.views.dashPaged);  // admin dash pagination
  app.get('/admin/user/:id', isLoggedIn, isAdmin, User.admin.views.userImpersonate); // user impersonation dash view
  app.get('/new/:token', User.views.new); // new user/password view
  app.get('/docs', isLoggedIn, GraphQL.docs); // GraphiQL view
  app.get('/docs/admin', isLoggedIn, isAdmin, GraphQL.admin.docs); // Admin GraphiQL view

  /* 404 everything else */
  app.use('*',(req,res) => { res.sendStatus(404); });  // [TODO] error view  
}