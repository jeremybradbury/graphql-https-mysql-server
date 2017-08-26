const Sequelize = require('sequelize');

const Events = function(sequelize, DataTypes){ 
  /* schema */
  let Event = sequelize.define('event', {
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
  return Event;
}
module.exports = Events;