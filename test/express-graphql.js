'use strict'

const logger = require('../lib/logger')
const tools = require('../lib/tools')

const {
  BM_AGENT_NAME
} = process.env

const nodeTiming = require('perf_hooks').performance.nodeTiming

logger(BM_AGENT_NAME, { loadTime: nodeTiming.duration })

const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')

const port = process.env.PORT || 9999

const schema = buildSchema(`
  type Query {
    add(x: Int, y: Int): Int
  }
`)

const root = {
  add: ({ x, y }) => x + y
}

const app = express()
app.use('/', graphqlHTTP({
  schema,
  rootValue: root
}))

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
