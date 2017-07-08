const { GraphQLInputObjectType, GraphQLString } = require('graphql')

module.exports = new GraphQLInputObjectType({
  name: 'EventInput',
  fields: {
    name: {
      type: GraphQLString
    },
    date: {
      type: GraphQLString
    }
  }
})
