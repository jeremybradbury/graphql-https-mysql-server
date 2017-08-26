'use strict';
const Sequelize = require('sequelize');

const Sessions = function(sequelize, DataTypes){ 
  /* schema */
  let Session = sequelize.define('Sessions', {
    'session_id': {
			type: DataTypes.STRING(32),
			primaryKey: true,
		},
		expires: DataTypes.DATE,
		data: DataTypes.TEXT,
  });
  return Session;
}

module.exports = Sessions;