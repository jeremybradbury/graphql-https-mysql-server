const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} = require('graphql')

module.exports = new GraphQLObjectType({
  name: "User",
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
      type: GraphQLString
    },
    expires: {
      type: GraphQLString
    },
    password: {
      type: GraphQLString
    }
  })
})
