const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URI)

const connection = mongoose.connection

connection.on('close', () => {
  console.log('MongoDB connection closed')
  process.exit(0)
})

module.exports = mongoose
