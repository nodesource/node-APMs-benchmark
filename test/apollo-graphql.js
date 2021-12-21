'use strict'

const logger = require('../lib/logger')
const tools = require('../lib/tools')

const {
  BM_AGENT_NAME
} = process.env

const nodeTiming = require('perf_hooks').performance.nodeTiming

logger(BM_AGENT_NAME, { loadTime: nodeTiming.duration })

const { ApolloServer, gql } = require('apollo-server')

const port = process.env.PORT || 9999

const typeDefs = gql`
  type Query {
    add(x: Int, y: Int): Int
  }
`

const resolvers = {
  Query: {
    add: (_, { x, y }) => x + y
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

process.on('SIGUSR1', function () {
  logger(BM_AGENT_NAME, tools.getMemoryUsage())
  logger(BM_AGENT_NAME, {
    cpu: tools.getCPUUsage(),
    elu: tools.getELUUsage(),
    uptime: process.uptime()
  })
  process.exit(0)
})

server.listen({ port })
