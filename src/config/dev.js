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
  dir: __dirname+'/../log',
  access: {
    fn: 'access.log',
    options: {
      size: '10M',
      compress: 'gzip'
    }
  },
  error: {
    fn: 'error.log',
    options: {
      file: {
        level: 'info',
        handleExceptions: true,
        json: true,
        maxsize: 10485760,
        zippedArchive: true,
        colorize: false
      },
      console: {
        level: 'debug',
        handleExceptions: true,
        //json: true,
        colorize: true
      }
    }
  }
};