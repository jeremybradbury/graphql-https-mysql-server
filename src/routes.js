const express = require('express');
const { User, GraphQL } = require('./controllers'); 
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
  
  /* authenticated static resources */
  app.use('/private',
    isLoggedIn,
    express.static(__dirname+'/private')
  );
  
  /* endpoints */
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
  
  /* views */
  app.get('/', User.views.homeHide); // hidden home. what? it's an API
  app.get('/logout', User.logout );// logout
  app.get('/login', User.views.login); // login view
  app.get('/dash', isLoggedIn, User.views.dash); // dash view
  app.get('/dash/admin/recover', isLoggedIn, isAdmin, User.admin.views.recover); // recover delted users view
  app.get('/dash/admin/recover/1', User.admin.views.recover1); // dont use page 1
  app.get('/dash/admin/recover/:page', isLoggedIn, isAdmin, User.admin.views.recoverPaged); // recover delted users pagination
  app.get('/dash/admin', isLoggedIn, isAdmin, User.admin.views.dash); // admin dash view
  app.get('/dash/admin/1', User.admin.views.dash1); // dont use page 1
  app.get('/dash/admin/:page', isLoggedIn, isAdmin, User.admin.views.dashPaged);  // admin dash pagination
  app.get('/dash/admin/user/:id', isLoggedIn, isAdmin, User.admin.views.userImpersonate); // user impersonation dash view
  app.get('/new/:token', User.views.new); // new user/password view
  
  /* GraphQL endpoints/views */
  app.post('/api', hasValidToken, GraphQL.api); // User GraphQL API endpoint
  app.get('/docs', isLoggedIn, GraphQL.docs); // GraphiQL view
  app.post('/api/admin', hasValidToken, isAdmin, GraphQL.admin.api); // Admin GraphQL API endpoint
  app.get('/docs/admin', isLoggedIn, isAdmin, GraphQL.admin.docs); // Admin GraphiQL view
  /* 404 everything else */
  app.use('*',(req,res) => { res.sendStatus(404); });  // [TODO] error view  
}