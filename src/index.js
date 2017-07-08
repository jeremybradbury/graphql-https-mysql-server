const express = require('express')
const graphqlHTTP = require('express-graphql')
const schema = require('./schema')

const server = express()

const dev = process.env.NODE_ENV !== 'production'
const PORT = process.env.PORT || 5000

server.use(
  '/graphql',
  graphqlHTTP((req, res, gql) => ({
    schema,
    graphiql: dev,
    pretty: dev
  }))
)

server.listen(PORT, err => {
  if (err) throw err

  console.log(`> Ready on PORT ${PORT}`)
})
