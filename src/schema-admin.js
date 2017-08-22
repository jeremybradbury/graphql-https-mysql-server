const { GraphQLSchema, GraphQLObjectType } = require('graphql');

const queries = require('./queries/admin');
const mutations = require('./mutations/admin');
const subscriptions = require('./subscriptions');

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: queries,
    description: 'Users: email, id or token required.'
  }),

  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: mutations,
    description: 'Users: email, id or token required. Email only for invites.'
  }),

  subscription: new GraphQLObjectType({
    name: 'Subscription',
    fields: subscriptions
  })
})
