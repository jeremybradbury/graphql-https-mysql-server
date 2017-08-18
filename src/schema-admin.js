const { GraphQLSchema, GraphQLObjectType } = require('graphql');

const queries = require('./queries/admin');
const mutations = require('./mutations/admin');
const subscriptions = require('./subscriptions');

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: queries
  }),

  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: mutations
  }),

  subscription: new GraphQLObjectType({
    name: 'Subscription',
    fields: subscriptions
  })
})
