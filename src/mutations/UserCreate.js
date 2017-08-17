const { GraphQLNonNull } = require('graphql');
const UserType = require('../types/user');
const UserInputType = require('../types/input/user');
const socket = require('../socket');

module.exports = {
  type: UserType,
  args: {
    data: {
      name: 'data',
      type: new GraphQLNonNull(UserInputType)
    }
  },
  resolve: (root, { data }, { db: { User } }) => {
    return new Promise((resolve, reject) => {
      User.sync()
        .then(() => {
          //console.log(data);
          return User.create(data);
        })
        .then(data => {
          socket.publish('USER_CREATED', {
            userCreated: data
          })
          resolve(data)
        })
        .catch(errors => reject(errors))
    })
  }
};