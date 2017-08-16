'use strict';
const bcrypt = require('bcryptjs');
module.exports = function (User,email,password) {
  return User.findOne({where: {email: email}})
    .then(user => {
        if(user && user.dataValues && bcrypt.compareSync(password, user.dataValues.password)){
          return user.dataValues;
        }
        return false;
    });
}