'use strict';
const fs = require('fs');
var config; 
if(fs.existsSync(__dirname+'/local.js')) {
  config = require('./local.js');
  console.log('config: local');
} else {
  config = (process.env.NODE_ENV == 'production') ? require('./prod.js') : require('./dev.js');
}
module.exports = config;