'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const {
  AgentOpts,
  ltsNameFromVersion,
  usesNSolid
} = require('./helper')
const { parse } = require('./parse')

async function capture (options) {
  const apms = []
  if (options.agents.includes(AgentOpts.NODE)) {
    apms.push('noop')
  }

  if (options.apms) {
    apms.push(...options.apms)
  }

  if (usesNSolid(options.agents)) {
    apms.push('nsolid')
  }
  if (options.agents.includes(AgentOpts.NSOLID_TRACING)) {
    apms.push('nsolid_tracing')
  }
  const runtimes = options.runtimes.map((runtime) => {
    return {
      node: runtime.nodeVersion,
      nsolid: `${runtime.nsolidVersion}-${ltsNameFromVersion(runtime.nodeVersion)}`
    }
  })

  const metadata = {
    id: Date.now(),
    tests: [],
    type: os.type(),
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    totalmem: os.totalmem(),
    freemem: os.freemem(),
    cpus: os.cpus(),
    runtimes,
    apms,
    metrics: {
      loadTime: 'milliseconds',
      rss: 'MBytes',
      heapTotal: 'MBytes',
      heapUsed: 'MBytes',
      external: 'MBytes',
      arrayBuffers: 'MBytes',
      cpu: '%',
      elu: '%',
      uptime: 'seconds',
      'latency.max': 'milliseconds',
      'latency.min': 'milliseconds',
      'latency.p50': 'milliseconds',
      'latency.p99': 'milliseconds',
      'requests.max': 'requests/second',
      'requests.min': 'requests/second',
      'requests.p50': 'requests/second',
      'requests.p99': 'requests/second',
      'throughput.max': 'bytes/second',
      'throughput.min': 'bytes/second',
      'throughput.p50': 'bytes/second',
      'throughput.p99': 'bytes/second',
      httpErrors: ''
    }
  }

  const dataDir = path.join(__dirname, `../reports/public/data/${metadata.id}`)
  fs.mkdirSync(dataDir, { recursive: true })
  const files = fs.readdirSync(`${options.dir}/logs`)
  for (const file of files) {
    const name = file.split('.')[0]
    const data = await parse(options.dir, name)
    metadata.tests.push(name)
    fs.writeFileSync(path.join(dataDir, `${name}.json`),
      JSON.stringify(data, null, 2))
  }

  fs.writeFileSync(path.join(dataDir, 'meta.json'),
    JSON.stringify(metadata, null, 2))
  console.log('Saved as', metadata.id)
  return metadata.id
}

module.exports = {
  capture
}
