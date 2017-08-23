const socket = require('../socket');
const UserType = require('../types/user');

module.exports = {
  type: UserType,
  subscribe: () => socket.asyncIterator('USER_CREATED')
}
