const { GraphQLNonNull } = require('graphql')
const EventType = require('../types/event')
const EventInputType = require('../types/input/event')
const Event = require('../db/event')

module.exports = {
  type: EventType,
  args: {
    data: {
      name: 'data',
      type: new GraphQLNonNull(EventInputType)
    }
  },
  resolve: (root, { data }) => {
    return new Promise((resolve, reject) => {
      const newEvent = new Event(data)

      newEvent
        .save()
        .then(data => resolve(data))
        .catch(errors => reject(errors))
    })
  }
}
