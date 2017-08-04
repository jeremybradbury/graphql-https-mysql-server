'use strict';
exports.appConfig = {
  host: process.env.API_HOST || 'localhost',
  url: process.env.API_URL || 'https://localhost',
  port: process.env.API_PORT || 3443,
};
exports.dbConfig = {
  user: 'root',
  password: 'root',
  host: 'localhost',
  database: 'graphql_api',
  port: 3306
};
exports.logConfig = {
  directory: '../log',
  accessLogName: 'access.log',
  accessLogOptions: {
    size: '10M',
    compress: 'gzip'
  },
  errorLogName: 'error.log',
  errorLogOptions: {
    level: 'warn',
    handleExceptions: true,
    json: true,
    maxsize: 10485760,
    zippedArchive: true,
    colorize: false
  },
  errorConsoleOptions: {
    level: 'error',
    handleExceptions: true,
    //json: true,
    colorize: true
  }
};