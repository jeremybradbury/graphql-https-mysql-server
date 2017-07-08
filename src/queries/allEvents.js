const { GraphQLList } = require('graphql')
const EventType = require('../types/event')
const Event = require('../db/event')
const getProjection = require('../utils/projection')

module.exports = {
  type: new GraphQLList(EventType),
  resolve: (root, args, options, fieldASTs) => {
    return new Promise((resolve, reject) => {
      const projection = getProjection(fieldASTs)

      Event.find({})
        .select(projection)
        .exec()
        .then(data => resolve(data))
        .catch(errors => reject(errors))
    })
  }
}
