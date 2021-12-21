'use strict'

const logger = require('../lib/logger')
const tools = require('../lib/tools')

const {
  BM_AGENT_NAME
} = process.env

const nodeTiming = require('perf_hooks').performance.nodeTiming

logger(BM_AGENT_NAME, { loadTime: nodeTiming.duration })

const Fastify = require('fastify')
const mercurius = require('mercurius')

const app = Fastify()

const port = process.env.PORT || 9999

const schema = `
  type Query {
    add(x: Int, y: Int): Int
  }
`

const resolvers = {
  Query: {
    add: (_, { x, y }) => x + y
  }
}

app.register(mercurius, {
  schema,
  resolvers
})

app.post('/', function (req, res) {
  return res.graphql(req.body.query)
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

app.listen(port)
