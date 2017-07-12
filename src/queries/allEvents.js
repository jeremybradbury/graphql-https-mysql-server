const { GraphQLList, GraphQLInt } = require('graphql')
const EventType = require('../types/event')
const getProjection = require('../utils/projection')

module.exports = {
  type: new GraphQLList(EventType),
  args: {
    first: {
      name: 'first',
      type: GraphQLInt
    },
    skip: {
      name: 'skip',
      type: GraphQLInt
    }
  },
  resolve: (
    root,
    { first = null, skip = null },
    { db: { Event } },
    fieldASTs
  ) => {
    return new Promise((resolve, reject) => {
      const projection = getProjection(fieldASTs)

      Event.find({})
        .select(projection)
        .skip(skip)
        .limit(first)
        .exec()
        .then(data => resolve(data))
        .catch(errors => reject(errors))
    })
  }
}
