// lookup user by token, while validating the token
module.exports = (Users,token,refresh = null) => Users.findOne({ where: {token: token}})
.then(user => {
  if (user) {
    var expires = new Date(user.expires);
    var now = new Date();
    if ((expires.getTime() >= now.getTime()) || (refresh && (user.refresh == refresh))) {
      return user.get({plain:true});
    } else {
      return null;
    }
  } else {
    return null;
  }
})