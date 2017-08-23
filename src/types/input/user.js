const { 
  GraphQLInputObjectType, 
  GraphQLString, 
  GraphQLID 
} = require('graphql');

module.exports = new GraphQLInputObjectType({
  name: 'UserInput',
  description: 'Id, Email or Token required to lookup. Email only for invites.',
  fields: {
    id: {
      type: GraphQLID
    },
    email: {
      type: GraphQLString // need to invite
    },
    token: {
      type: GraphQLString
    },
    expires: {
      type: GraphQLString
    },
    status: {
      type: GraphQLString
    },
  }
})
