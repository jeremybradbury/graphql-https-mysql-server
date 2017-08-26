const LocalStrategy = require('passport-local').Strategy;
const TokenStrategy = require("passport-http-bearer").Strategy;
const db = require('../db');
const { log } = require('auto-load')('src/tools');

module.exports = function(passport) {
  // user auth from passport local
  passport.serializeUser(function(user, next) {
    next(null, user.id); // serialize id
  });
  passport.deserializeUser(function(id, next) {
    db.Users.findById(id) // get user by id
    .then(user => {
      next(null, user);
    })
    .catch(e => {
      next(e, false);
    })
  });
  passport.use(new LocalStrategy({ 
      usernameField : 'email', 
      passReqToCallback : true 
    },
    function(req, email, password, next) { 
      db.Users.check(email,password)
        .then(user => {
          if (!user)
            return next(null, false, req.flash('loginMessage', 'Invalid credentials provided. Please, try again.'));
          if(!user.status)
            return next(null, false, req.flash('loginMessage', 'User account has been disabled. Contact your administrator for more information.'));
          return next(null, user);
        })
        .catch(e => {
          return next(e, null);
        });
    }
  ));
  // token auth from passport bearer
  passport.use(new TokenStrategy((token, next) => {
    return db.Users.findByToken(token)
      .then(user => {
        if (!user || user.status == null) return next(null, false);
        return next(null, user);
      });
  }));
};