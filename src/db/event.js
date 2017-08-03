const Sequelize = require('sequelize');
const sequelize = require('./connection');

const Event = sequelize.define('event', {
  name: {
    type: Sequelize.STRING,
    vailidate: {
      notNull: true
    }
  },
  date: {
    type: Sequelize.DATE
  }
});

module.exports = Event;