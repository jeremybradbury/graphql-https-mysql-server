const { GraphQLNonNull, GraphQLID } = require('graphql')
const EventType = require('../types/event')
const EventInputType = require('../types/input/event')
const socket = require('../socket')

module.exports = {
  type: EventType,
  args: {
    id: {
      name: 'id',
      type: new GraphQLNonNull(GraphQLID)
    },
    data: {
      name: 'data',
      type: new GraphQLNonNull(EventInputType)
    }
  },
  resolve: (root, args, {req: {app: {db: {Events}}}}) => {
    return new Promise((resolve, reject) => {
      Events.findOne({where: {id: parseInt(args.id)}})
        .then(event=>event.update(args.data))
        .then(data => {
          socket.publish('EVENT_UPDATED', {
            eventUpdated: data
          })
          resolve(data);
        })
        .catch(errors => reject(errors));
    })
  }
}
