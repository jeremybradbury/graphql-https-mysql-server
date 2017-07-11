const { GraphQLNonNull } = require('graphql')
const EventType = require('../types/event')
const EventInputType = require('../types/input/event')
const socket = require('../socket')

module.exports = {
  type: EventType,
  args: {
    data: {
      name: 'data',
      type: new GraphQLNonNull(EventInputType)
    }
  },
  resolve: (root, { data }, { db: { Event } }) => {
    return new Promise((resolve, reject) => {
      const newEvent = new Event(data)

      newEvent
        .save()
        .then(data => {
          socket.publish('EVENT_CREATED', {
            eventCreated: data
          })

          resolve(data)
        })
        .catch(errors => reject(errors))
    })
  }
}
