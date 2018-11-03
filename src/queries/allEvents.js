const { GraphQLList, GraphQLInt } = require('graphql')
const EventType = require('../types/event')
const getProjection = require('../tools/projection')

module.exports = {
  type: new GraphQLList(EventType),
  args: {
    first: {
      name: 'limit',
      type: GraphQLInt
    },
    skip: {
      name: 'offset',
      type: GraphQLInt
    }
  },
  resolve: (
    root,
    { first = null, skip = null },
    { req: { app: {db: {Events}}} },
    fieldASTs
  ) => {
    return new Promise((resolve, reject) => {
      const projection = Object.keys(getProjection(fieldASTs));
      const q = { 
        attributes: projection,
        offset: skip,
        limit: first
      }
      Events.findAll(q)
        .then(events => resolve(events))
        .catch(errors => reject(errors));
    })
  }
}
