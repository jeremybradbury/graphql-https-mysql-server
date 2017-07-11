const mongoose = require('./connection')
const { Schema } = mongoose

module.exports = mongoose.model(
  'Event',
  Schema({
    name: {
      type: String,
      required: true
    },
    date: Date
  })
)
