const { GraphQLID, GraphQLNonNull } = require('graphql')
const EventType = require('../types/event')
const getProjection = require('../utils/projection')

module.exports = {
  type: EventType,
  args: {
    id: {
      name: 'id',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: (root, { id }, { db: { Event } }, fieldASTs) => {
    return new Promise((resolve, reject) => {
      const projection = getProjection(fieldASTs)

      Event.findById(id)
        .select(projection)
        .exec()
        .then(data => resolve(data))
        .catch(errors => reject(errors))
    })
  }
}
