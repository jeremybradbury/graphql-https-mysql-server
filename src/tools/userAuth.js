'use strict';
const bcrypt = require('bcryptjs');
module.exports = function (User,email,password) {
  return User.findOne({where: {email: email}})
    .then(user => {
        if(user && bcrypt.compareSync(password, user.password)){
          return user.dataValues;
        }
        return false;
    })
    .catch(e => {
      console.error(e);
    });
}