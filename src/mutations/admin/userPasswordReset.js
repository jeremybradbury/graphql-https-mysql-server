const { GraphQLNonNull } = require('graphql');
const UserType = require('../../types/user');
const UserInputType = require('../../types/input/user');
//const socket = require('../socket');

module.exports = {
  type: UserType,
  args: {
    data: {
      name: 'data',
      type: new GraphQLNonNull(UserInputType)
    }
  },
  resolve: (root, { data },  {req: {app: {db: {User}}},res} ) => {
    return new Promise((resolve, reject) => {
      User.findOne({where: data}) // reset someone's passoword
        .then((user) => {
          let password = user.resetPass();
          res.json({data: {password: password}});
          resolve(user);
        })
        .catch(errors => reject(errors))
    })
  }
};