const { GraphQLList, GraphQLInt } = require('graphql')
const UserType = require('../../types/user')
const getProjection = require('../../tools/projection')

module.exports = {
  type: new GraphQLList(UserType),
  args: {
    first: {
      name: 'limit',
      type: GraphQLInt
    },
    skip: {
      name: 'offset',
      type: GraphQLInt
    }
  },
  resolve: (
    root,
    { first = null, skip = null },
    { req: {app: {db: {Users}}}},
    fieldASTs
  ) => {
    return new Promise((resolve, reject) => {
      const projection = Object.keys(getProjection(fieldASTs));
      const q = { 
        attributes: projection,
        order: [['createdAt', 'DESC']],
        offset: skip,
        limit: first
      }
      Users.findAll(q)
        .then(users => resolve(users))
        .catch(errors => reject(errors));
    })
  }
}
