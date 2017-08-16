const { 
  GraphQLInputObjectType, 
  GraphQLString, 
  GraphQLNonNull 
} = require('graphql');

module.exports = new GraphQLInputObjectType({
  name: 'UserInput',
  fields: {
    email: {
      type: new GraphQLNonNull(GraphQLString)
    },
    status: {
      type: GraphQLString
    }
  }
})
