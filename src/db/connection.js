const db =  {};
const Sequelize = require('sequelize');
const { dbConfig } = require('../config');
const { log } = require('auto-load')('src/tools');

const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  dialect: 'mysql',
  pool: { max: 4, min: 0, idle: 10000 },
  logging: log.e.silly // don't disable,  log level silly
});

const connection = sequelize.sync()
  .then(() => {
    log.e.info('Connection has been established successfully.');
  })
  .catch(err => {
    log.e.error('Unable to connect to the database:', err);
  });
  
db.sequelize = sequelize;
module.exports = db;