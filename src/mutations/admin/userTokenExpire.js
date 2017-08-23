const { GraphQLNonNull } = require('graphql');
const UserType = require('../../types/user');
const UserInputType = require('../../types/input/user');
//const socket = require('../../socket');

module.exports = {
  type: UserType,
  description: 'Email, token or id is required.',
  args: {
    data: {
      name: 'data',
      type: new GraphQLNonNull(UserInputType)
    }
  },
  resolve: (root, { data }, {req: {app: {db: {User}}}}) => {
    return new Promise((resolve, reject) => {
      User.findOne({where: data})
        .then((user) => {
          user.tokenExpire();
          resolve(user.dataValues);
        })
        .catch(errors => reject(errors))
    })
  }
};