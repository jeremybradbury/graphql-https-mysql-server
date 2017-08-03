const Sequelize = require('sequelize');
const dbName = process.env.API_DB || 'graphql_api';
const dbUser = process.env.API_DB_USER || 'root';
const dbPass = process.env.API_DB_PASSWORD || 'root';
const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 4,
    min: 0,
    idle: 10000
  }
});

const connection = sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
  
module.exports = sequelize;
