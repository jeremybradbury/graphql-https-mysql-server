'use strict';
const Sequelize = require('sequelize');
const tools = require('auto-load')('src/tools');
const bcrypt = require('bcryptjs');

const Users = function(sequelize, DataTypes) { 
  /* schema */
  let User = sequelize.define('user', {
    id: { 
      type: DataTypes.CHAR(36),
      defaultValue: Sequelize.UUIDV4, // noSQL style ids
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      vailidate: {
        notNull: true
      }
    },
    password: {
      type: DataTypes.STRING(75)
    },
    status: {
      type: DataTypes.STRING
    },
    token: {
      type: DataTypes.STRING(600)
    },
    expires: {
      type: DataTypes.DATE
    }
  },{
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['token']
      }
    ],
    paranoid: true // undelete power for removed users
  });
  /* instance methods */
  User.prototype.disable = function() { this.update({status: null}); };
  User.prototype.enable = function(status = 'active') { this.update({status: status}); };
  User.prototype.tokenNew = function(days = 7) {
    let token = tools.generateToken();
    let expires = new Date();
    expires.setDate(expires.getDate() + days);
    this.update({expires: expires, token: token});
    return {expires: expires, token: token};
  };
  User.prototype.tokenExpire = function() {
    let expired = new Date;
    expired.setDate(expired.getDate() - 7); // set expires to last week
    this.update({expires: expired.toISOString() } ); // no further API requests will be accepted
    return expired;
  };
  User.prototype.resetPass = function() {
    let pass = tools.newPass();
    let hash = bcrypt.hashSync(pass, 12); // hash pass
    this.update({password:hash});
    return pass;
  };
  User.prototype.recover = function() {
    this.setDataValue('deletedAt', null);
    return this.save({ paranoid: false });
  };
  /* class methods */
  User.findByToken = function(token) {
    // auth and return user promise (user.id)
    return tools.findByToken(this,token);
  };
  User.check = function(email,pass) {
    // auth and return user promise (user.token) 
    return tools.userAuth(this,email,pass);
  };
  /* hooks */
  User.beforeCreate((user, options) => {
    let expires = new Date();
    expires.setDate(expires.getDate() + 1); // 24 hour expire
    user.setDataValue('expires', expires);
    user.setDataValue('token', tools.generateToken());
    user.setDataValue('status', 'active');
  });
  return User;
}
module.exports = Users;