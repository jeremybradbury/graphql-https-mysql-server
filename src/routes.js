const express = require('express');
const { User, GraphQL } = require('./controllers'); 
module.exports = function(app, passport) {
  app.use('/private', // authenticated static resources
    User.isLoggedIn,
    express.static(__dirname+'/private')
  );
  User.tokenAuth = passport.authenticate("bearer", { session: false }); // token auth middleware
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
  /* views */
  app.get('/', User.views.homeHide); // hidden home. what? it's an API
  app.get('/logout', User.logout );// logout
  app.get('/login', User.views.login); // login view
  app.get('/dash', User.isLoggedIn, User.views.dash); // dash view
  app.get('/dash/admin', User.isLoggedIn, User.isAdmin, User.views.admin.dash); // admin dash view
  app.get('/dash/admin/1', (req,res) => { res.redirect('/dash/admin'); }); // dont use page 1
  app.get('/dash/admin/:page', User.isLoggedIn, User.isAdmin, User.views.admin.dashPaged);  // admin dash pagination
  app.get('/dash/admin/user/:id', User.isLoggedIn, User.isAdmin, User.views.admin.userImpersonate); // user impersonation dash view
  app.get('/new/:token', User.views.new); // new user/password view
  /* GraphQL endpoints/views */
  app.post('/api', User.tokenAuth, GraphQL.api); // User GraphQL API endpoint
  app.get('/docs', User.isLoggedIn, GraphQL.docs); // GraphiQL view
  app.post('/api/admin', User.tokenAuth, User.isAdmin, GraphQL.admin.api); // Admin GraphQL API endpoint
  app.get('/docs/admin', User.isLoggedIn, User.isAdmin, GraphQL.admin.docs); // Admin GraphiQL view
  /* 404 everything else */
  app.use('*',(req,res) => { res.sendStatus(404); });  // [TODO] error view
}