'use strict'

const logger = require('../lib/logger')
const tools = require('../lib/tools')

const {
  BM_AGENT_NAME
} = process.env

const nodeTiming = require('perf_hooks').performance.nodeTiming

logger(BM_AGENT_NAME, { loadTime: nodeTiming.duration })

const express = require('express')
const app = express()
const port = process.env.PORT || 9999

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/ping', (req, res) => {
  logger(BM_AGENT_NAME, tools.getMemoryUsage())
  logger(BM_AGENT_NAME, {
    cpu: tools.getCPUUsage(),
    elu: tools.getELUUsage(),
    uptime: process.uptime()
  })
  res.send('Ok')
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
