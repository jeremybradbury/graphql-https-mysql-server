'use strict';
const Sequelize = require('sequelize');
const sequelize = require('../connection');
const tools = require('auto-load')('src/tools');
const bcrypt = require('bcryptjs');

// schema
const User = sequelize.define('user', {
  id: { 
    type: Sequelize.CHAR(36),
    defaultValue: Sequelize.UUIDV4, // noSQL style ids
    primaryKey: true
  },
  email: {
    type: Sequelize.STRING,
    vailidate: {
      notNull: true
    }
  },
  password: {
    type: Sequelize.STRING(75)
  },
  status: {
    type: Sequelize.STRING
  },
  token: {
    type: Sequelize.STRING(600)
  },
  expires: {
    type: Sequelize.DATE
  }
},{
  indexes: [
    {
      unique: true,
      fields: ['email']
    }
  ]
});
// instance methods
User.prototype.disable = function() {
  this.update({status: null});
};
User.prototype.enable = function(status = 'active') {
  this.update({status: status});
};
User.prototype.tokenCheck = function(token) {
  // TODO: check expiry
  return (this.token == token) ? true : false;
};
User.prototype.tokenNew = function(days = 7) {
  let token = tools.generateToken();
  let expires = new Date();
  expires.setDate(expires.getDate() + days);
  this.update({expires: expires, token: token});
  return {expires: expires, token: token};
};
User.prototype.tokenExpire = function() {
  let expired = new Date;
  expired.setDate(expired.getDate() - 7); // set expire to last week
  this.update({expires: expired.toISOString() } ); // no further API requests will be accepted
  return expired;
};
User.prototype.encryptPass = function(pass) {
  let hash = bcrypt.hashSync(pass, 12); // hash pass
  this.update({password:hash}); 
};
// class methods
User.findByToken = function(token) {
  return tools.findByToken(this,token);
};
User.check = function(email,pass) {
  return tools.userAuth(this,email,pass);
};
// hooks
User.beforeCreate((user, options) => {
  let expires = new Date();
  expires.setDate(expires.getDate() + 1); // 24 hour expire
  user.setDataValue('expires', expires);
  user.setDataValue('token', tools.generateToken());
  user.setDataValue('status', 'active');
});
module.exports = User;