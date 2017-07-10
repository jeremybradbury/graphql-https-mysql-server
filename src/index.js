const { createServer } = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express')
const schema = require('./schema')

const app = express()

const dev = process.env.NODE_ENV !== 'production'
const PORT = process.env.PORT || 5000

app.use(bodyParser.json())

app.use(
  '/graphql',
  graphqlExpress({
    schema
  })
)

app.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql'
  })
)

const server = createServer(app)

server.listen(PORT, err => {
  if (err) throw err

  console.log(`> Ready on PORT ${PORT}`)
})
