const { GraphQLList, GraphQLInt } = require('graphql')
const UserType = require('../types/user')
const getProjection = require('../tools/projection')

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
    { db: { User } },
    fieldASTs
  ) => {
    return new Promise((resolve, reject) => {
      const projection = Object.keys(getProjection(fieldASTs));
      const q = { 
        attributes: projection,
        offset: skip,
        limit: first
      }
      User.findAll(q)
        .then(users => { resolve(users); })
        .catch(errors => reject(errors));
    })
  }
}
