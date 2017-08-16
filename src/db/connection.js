const Sequelize = require('sequelize');
const { dbConfig } = require('../config');
const tools = require('auto-load')('src/tools');

const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  dialect: 'mysql',
  pool: { max: 4, min: 0, idle: 10000 },
  logging: tools.log.e.silly // don't disable,  log level silly
});
const connection = sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
   
module.exports = sequelize;