const LocalStrategy = require('passport-local').Strategy;
const TokenStrategy = require("passport-http-bearer").Strategy;
const db = require('../db/admin');
const { log } = require('auto-load')('src/tools');

module.exports = function(passport) {
  // user auth from passport local
  passport.serializeUser(function(user, next) {
    next(null, user.id); // serialize id
  });
  passport.deserializeUser(function(id, next) {
    db.User.findById(id) // get user by id
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
      db.User.check(email,password)
        .then(user => {
          if (!user) return next(null, false, req.flash('loginMessage', 'Invalid credentials provided. Please, try again.'));
          log.e.silly(user);
          return next(null, user);
        })
        .catch(e => {
          log.e.error(e);
        });
    }
  ));
  // token auth from passport bearer
  passport.use(new TokenStrategy((token, next) => {
    return db.User.findByToken(token)
      .then(user => {
        if (!user || user.status == null) return next(null, false);
        log.e.silly(user); 
        return next(null, user);
      });
  }));
};