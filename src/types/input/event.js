const { 
  GraphQLInputObjectType, 
  GraphQLString,
  GraphQLID 
} = require('graphql');

module.exports = new GraphQLInputObjectType({
  name: 'EventInput',
  fields: {
    id: {
      type: GraphQLID
    },
    name: {
      type: GraphQLString
    },
    date: {
      type: GraphQLString
    }
  }
})
