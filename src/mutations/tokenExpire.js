const { GraphQLNonNull } = require('graphql');
const UserType = require('../types/user');
const UserInputType = require('../types/input/user');
//const socket = require('../socket');

module.exports = {
  type: UserType,
  resolve: (root, { }, { User, user }) => {
    return new Promise((resolve, reject) => {
      User.findOne({where: {id: user.id}}) // expire MY token
        .then((User) => {
          let result = User.dataValues;
          token = User.tokenExpire();
          return Object.assign(result,token);
        })
        .then((user)=>{
          resolve(user);
        })
        .catch(errors => reject(errors))
    })
  }
};