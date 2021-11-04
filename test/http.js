'use strict'

const logger = require('../lib/logger')
const tools = require('../lib/tools')

const {
  BM_AGENT_NAME
} = process.env

const nodeTiming = require('perf_hooks').performance.nodeTiming

logger(BM_AGENT_NAME, { loadTime: nodeTiming.duration })

const port = process.env.PORT || 9999

const http = require('http')

const server = http.createServer((req, res) => {
  if (req.url === '/ping') {
    logger(BM_AGENT_NAME, tools.getMemoryUsage())
    logger(BM_AGENT_NAME, {
      cpu: tools.getCPUUsage(),
      elu: tools.getELUUsage(),
      uptime: process.uptime()
    })
    res.write('Ok')
    res.end()
    return
  }

  res.write('Hello World!')
  res.end()
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

server.listen(port)
