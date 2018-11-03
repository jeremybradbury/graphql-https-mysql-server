const eventCreate = require('./eventCreate');
const eventUpdate = require('./eventUpdate');
const tokenExpire = require('./tokenExpire');
const tokenNew = require('./tokenNew');
const passwordReset = require('./passwordReset');

module.exports = {
  eventCreate,
  eventUpdate,
  tokenExpire,
  tokenNew,
  passwordReset
}