const db = require('./connection');
              
var models = [                 
  'Users',
  'Sessions',
  'Events'           
];
models.forEach(function(model) {
  module.exports[model] = db.sequelize.import(__dirname + '/' + model);
});
module.exports.sequelize = db.sequelize;
module.exports.Sequelize = db.Sequelize;