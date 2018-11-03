'use strict';
const Sequelize = require('sequelize');

const Sessions = function(sequelize, DataTypes){ 
  /* schema */
  let Session = sequelize.define('session', {
    'sid': {
			type: DataTypes.STRING(32),
			primaryKey: true,
		},
		userId: DataTypes.STRING(36),
		expires: DataTypes.DATE,
		data: DataTypes.TEXT,
  });
    /* hooks */
  Session.beforeUpdate((session, options) => {
    if(session.dataValues.userId){
      Session.find({where: {userId: session.dataValues.userId}})
        .then(existing => {
          if (existing) { existing.destroy(); }
        });
    }
  });
  return Session;
}
module.exports = Sessions;