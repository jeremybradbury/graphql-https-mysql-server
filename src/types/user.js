const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} = require('graphql')

module.exports = new GraphQLObjectType({
  name: "User",
  description: 'Email, token or id required for lookup.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    email: {
      type: new GraphQLNonNull(GraphQLString)
    },
    status: {
      type: GraphQLString
    },
    token: {
      type: new GraphQLNonNull(GraphQLString)
    },
    password: {
      type: GraphQLString
    },
    expires: {
      type: GraphQLString
    },
    url: {
      type: GraphQLString
    }
  })
})
