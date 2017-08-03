const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} = require('graphql')

module.exports = new GraphQLObjectType({
  name: "Event",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    date: {
      type: GraphQLString
    }
  })
})
