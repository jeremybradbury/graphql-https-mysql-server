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
  resolve: (root, { data }, {req: {app: {db: {Events}}}}) => {
    return new Promise((resolve, reject) => {
      Events.sync().then(() => {
        console.log(data);
        return Event.create(data);
      }).then(data => {
          socket.publish('EVENT_CREATED', {
            eventCreated: data
          })
          resolve(data)
        })
        .catch(errors => reject(errors))
    })
  }
}
