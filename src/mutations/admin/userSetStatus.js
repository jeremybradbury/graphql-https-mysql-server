const { 
  GraphQLString,
  GraphQLID 
} = require('graphql');
const UserType = require('../../types/user');
//const socket = require('../../socket');

module.exports = {
  type: UserType,
  description: 'Email, token or id is required.',
  args: {
    id: {
      name: 'id',
      type: GraphQLID,
      description: 'Email, token or id is required.'
    },
    email: {
      name: 'email',
      type: GraphQLString,
      description: 'Email, token or id is required.'
    },
    token: {
      name: 'token',
      type: GraphQLString,
      description: 'Email, token or id is required.'
    },
    status: {
      name: 'status',
      type: GraphQLString,
      description: 'If no status supplied, user is disabled'
    }
  },
  resolve: (root, args, {req: {app: {db: {User}}}}) => {
    return new Promise((resolve, reject) => {
      let status = args.status; // save this for setting
      delete args.status; // remove from the query
      User.findOne({where: args})
        .then((user) => {
          let expires, result;
          if(status) {
            expires = user.enable(status);
          } else {
            expires = user.disable();
          }
          result = user.dataValues;
          return Object.assign(result,expires);
        })
        .then((user)=>{
          resolve(user);
        })
        .catch(errors => reject(errors))
    })
  }
};