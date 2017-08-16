const { GraphQLID, GraphQLNonNull } = require('graphql')
const UserType = require('../types/user')
const getProjection = require('../tools/projection')

module.exports = {
  type: UserType,
  args: {
    id: {
      name: 'id',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: (root, { id }, { db: { User } }, fieldASTs) => {
    return new Promise((resolve, reject) => {
      const projection = Object.keys(getProjection(fieldASTs));
      const q = {
        where: {id: id}, 
        attributes: projection
      };
      User.find(q)
        .then(users => resolve(users))
        .catch(errors => reject(errors));
    })  
  }
}
