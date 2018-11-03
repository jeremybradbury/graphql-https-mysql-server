const { 
  graphqlExpress, 
  graphiqlExpress 
} = require('graphql-server-express');
const schema = require('../schema');
const schemaAdmin = require('../schema-admin');
const { appConfig } = require('../config');

exports.api = graphqlExpress((req, res) => {// User GraphQL API endpoint
  let Users = req.app.db.Users; // model
  let user = req.user; // self
  return { context: { req, res, Users, user }, schema: schema }; // user schema
});
exports.docs = graphiqlExpress((req) => { // GraphiQL view
  let url = req.app.url.replace('https:','wss:');
  return {
    endpointURL: '/api',
    subscriptionsEndpoint: `${url}/subscriptions`,
    passHeader: `'Authorization': 'Bearer ${req.user.token}'` // forward user's token (set by passport)
  }
});
exports.admin = {};
exports.admin.api = graphqlExpress((req,res) => ({context: { req, res }, schema: schemaAdmin })); // Admin GraphQL API endpoint
exports.admin.docs = graphiqlExpress((req) => { // Admin GraphiQL view
  let url = req.app.url.replace('https:','wss:');
  return {
    endpointURL: '/api/admin',
    subscriptionsEndpoint: `${url}/subscriptions`,
    passHeader: `'Authorization': 'Bearer ${req.user.token}'` // forward admin's token (set by passport)
  }
});