const { 
  GraphQLString,
  GraphQLID,
  GraphQLNonNull 
} = require('graphql');
const UserType = require('../../types/user');
//const socket = require('../../socket');

module.exports = {
  type: UserType,
  description: 'Id is required.',
  args: {
    id: {
      name: 'id',
      type: new GraphQLNonNull(GraphQLID),
      description: 'Required.'
    }
  },
  resolve: (root, args, {req: {app: {db: {Users}}}}) => {
    console.log({where: args});
    return new Promise((resolve, reject) => {
      let status = args.status; // save this for setting
      delete args.status; // remove from the query
      Users.findOne({where: args})
        .then((user) => {
          console.log(user);
          resolve(user.destroy());
        })
        .catch(errors => reject(errors));
    })
  }
};