const socket = require('../socket')
const EventType = require('../types/event')

module.exports = {
  type: EventType,
  subscribe: () => socket.asyncIterator('EVENT_CREATED')
}
