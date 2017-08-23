const { GraphQLNonNull } = require('graphql');
const UserType = require('../types/user');
const UserInputType = require('../types/input/user');
//const socket = require('../socket');

module.exports = {
  type: UserType,
  resolve: (root, { }, { User, user }) => {
    return new Promise((resolve, reject) => {
      User.findOne({where: {id: user.id}}) // reset MY token
        .then((User) => {
          return User.dataValues;
        })
        .then((user)=>{
          resolve(user);
        })
        .catch(errors => reject(errors))
    })
  }
};