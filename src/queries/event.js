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
      const projection = Object.keys(getProjection(fieldASTs));
      const q = {
        where: {id: id}, 
        attributes: projection
      };
      Event.find(q).then(events => resolve(events))
        .catch(errors => reject(errors));
    })  
  }
}
