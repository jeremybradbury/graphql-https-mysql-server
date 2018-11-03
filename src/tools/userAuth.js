// authenticate bcrypted passwords
const bcrypt = require('bcryptjs');
module.exports = function (Users,email,password) {
  return Users.findOne({where: {email: email}})
    .then(user => {
      if(user && user.dataValues && bcrypt.compareSync(password, user.dataValues.password)){
        return user;
      } else {
        return false;
      }
  });
}