'use strict'

const logger = require('../lib/logger')
const tools = require('../lib/tools')

const {
  BM_AGENT_NAME,
  DURATION
} = process.env

const nodeTiming = require('perf_hooks').performance.nodeTiming

logger(BM_AGENT_NAME, { loadTime: nodeTiming.duration })

const port = process.env.PORT || 9999

const { loadTest } = require('loadtest')

loadTest(
  {
    url: `http://localhost:${port}`,
    concurrency: 10,
    maxSeconds: DURATION
  },
  (err, result) => {
    if (err) {
      throw err
    }

    logger(BM_AGENT_NAME, tools.getMemoryUsage())
    logger(BM_AGENT_NAME, {
      cpu: tools.getCPUUsage(),
      elu: tools.getELUUsage(),
      uptime: process.uptime()
    })

    logger(BM_AGENT_NAME, {
      'latency.max': result.maxLatencyMs,
      'latency.min': result.minLatencyMs,
      'latency.p50': result.percentiles['50'],
      'latency.p99': result.percentiles['99'],
      'requests.avg': result.rps,
      errors: result.totalErrors
    })
  }
)
