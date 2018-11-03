const db = require('./connection');
              
var models = [                 
  'Users',
  'Sessions',
  'Events'           
];
models.forEach(function(model) {
  module.exports[model] = db.sequelize.import(__dirname + '/' + model);
});
db.sequelize.sync().then(synced => synced);
module.exports.sequelize = db.sequelize;