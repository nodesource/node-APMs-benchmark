'use strict'

const logger = require('../lib/logger')
const tools = require('../lib/tools')

const {
  BM_AGENT_NAME
} = process.env

const nodeTiming = require('perf_hooks').performance.nodeTiming

logger(BM_AGENT_NAME, { loadTime: nodeTiming.duration })

const host = 'localhost'
const port = process.env.PORT || 9999

const Hapi = require('hapi')

const server = new Hapi.Server({ host, port })

server.route({
  method: 'GET',
  path: '/',
  handler: function (request, h) {
    return h.response('Hello World!')
  }
})

server.route({
  method: 'GET',
  path: '/ping',
  handler: function (request, h) {
    logger(BM_AGENT_NAME, tools.getMemoryUsage())
    logger(BM_AGENT_NAME, {
      cpu: tools.getCPUUsage(),
      elu: tools.getELUUsage(),
      uptime: process.uptime()
    })
    return h.response('Ok')
  }
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

server.start().catch(err => console.log(err))
