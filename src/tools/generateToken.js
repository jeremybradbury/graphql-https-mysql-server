var crypto = require('crypto');
module.exports = function(){
  var len = parseInt(crypto.randomBytes(1).toString('hex'), 16) / 2; // random length 0 to 256/2= 128 + 140
  len = Math.round(len+140); // so (140 to 268)*2 is 280 to 536 (600 max chars in field)
  return crypto.randomBytes(len).toString('hex');
}