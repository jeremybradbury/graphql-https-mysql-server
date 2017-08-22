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
      let status = data.status; // save this for setting
      delete data.status; // remove from the query
      User.findOne({where: data})
        .then((user) => {
          let expires = user.disable();
          if(status){
            expires = user.enable(status);
          }
          let result = user.dataValues;
          return Object.assign(result,expires);
        })
        .then((user)=>{
          resolve(user);
        })
        .catch(errors => reject(errors))
    })
  }
};