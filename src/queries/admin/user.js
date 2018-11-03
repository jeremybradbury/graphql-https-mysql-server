const { 
  GraphQLID, 
  GraphQLString 
} = require('graphql');
const UserType = require('../../types/user');
const getProjection = require('../../tools/projection');

module.exports = {
  type: UserType,
  description: 'Email, id or token required.',
  args: {
    id: {
      name: 'id',
      type: GraphQLID
    },
    email: {
      name: 'email',
      type: GraphQLString
    },
    token: {
      name: 'token',
      type: GraphQLString
    }
  },
  resolve: (
    root, 
    data, 
    { req: {app: {db: {Users}}}},
    fieldASTs
  ) => {
      return new Promise((resolve, reject) => {
        const projection = Object.keys(getProjection(fieldASTs));
        if(Object.keys(data).length !== 0){
          const q = {
            where: data, 
            attributes: projection
          };
          Users.findOne(q)
            .then(user => resolve(user))
            .catch(errors => reject(errors));
        } else {
          reject('User not found');
        }
      });
    }
}
