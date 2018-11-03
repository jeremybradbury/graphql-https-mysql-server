// manage error and access logging
const { logConfig } = require('../config');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const access = require('morgan');
const winston = require('winston');

fs.existsSync(logConfig.dir) || fs.mkdirSync(logConfig.dir);

const aStream = rfs(logConfig.dir+'/'+logConfig.access.fn, logConfig.access.options);
const eOpts = Object.assign({}, logConfig.eLogOptions, {filename: logConfig.dir + "/" + logConfig.error.fn});
const e = new winston.Logger({
  transports: [
    new winston.transports.File(eOpts),
    new winston.transports.Console(logConfig.error.options.console)
  ],
  exitOnError: false
});
const eStream = {
  write: function(message, encoding) {
    e.log(message);
  }
}
access.callback = function (tokens, req, res) { 
  return [
    tokens['remote-addr'](req, res),
    tokens['remote-user'](req, res),
    tokens['date'](req, res,'clf'), 
    tokens['method'](req, res),
    req.url.replace(/(token=[0-9A-Za-z]*)/,''), // strip url param token from logs
    'HTTP v', 
    tokens['http-version'](req, res),
    '-',
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), 
    req.originalUrl.replace(/(token=[0-9A-Za-z]*)/,''), // strip url param token from logs
    tokens['user-agent'](req, res),
    tokens['response-time'](req, res), 
    'ms'
  ].join(' ');
};
module.exports = {
  access,
  aStream,
  e,
  eStream
};