const { GraphQLSchema, GraphQLObjectType } = require('graphql')

const queries = require('./queries')
const mutations = require('./mutations')

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: queries
  }),

  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: mutations
  })
})
