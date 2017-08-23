const { GraphQLNonNull } = require('graphql');
const UserType = require('../types/user');
const UserInputType = require('../types/input/user');
//const socket = require('../socket');


module.exports = {
  type: UserType,
  args: {
    data: {
      name: 'data',
      type: new GraphQLNonNull(UserInputType)
    }
  },
  resolve: (root, { data }, { User, user, res }) => {
    return new Promise((resolve, reject) => {
      User.findOne({where: {id: user.id}}) // reset MY password
        .then((u) => {
          let password = u.resetPass(); // update db w ecrypted pass
          res.json({data: {password: password}}); // return generated passphrase (only once)
          resolve(u); // resolve found user
        })
        .catch(errors => reject(errors))
    })
  }
};