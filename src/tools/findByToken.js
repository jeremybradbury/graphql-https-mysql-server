module.exports = function (Users,token) {
  return Users.findOne({
    where: {token: token}
  }).then(user => {
    if (user) {
      var expires = new Date(user.expires);
      var now = new Date();
      if (expires.getTime() >= now.getTime()) {
        return user.dataValues;
      } else {
        let err = new Error('Token has expired');
        return err;
      }
    } else {
      let err = new Error('Token does not exist');
      return err;
    }
  })
}