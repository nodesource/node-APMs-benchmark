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
  if (options.agents.includes(AgentOpts.NSOLID_OTLP)) {
    for (const apm of options.otlp_apms) {
      apms.push(apm)
    }
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
      loadTime: 'milliseconds (less is better)',
      rss: 'MBytes (less is better)',
      heapTotal: 'MBytes (less is better)',
      heapUsed: 'MBytes (less is better)',
      external: 'MBytes (less is better)',
      arrayBuffers: 'MBytes (less is better)',
      cpu: '% (less is better)',
      elu: '% (less is better)',
      uptime: 'seconds (higher is better)',
      'latency.max': 'milliseconds (less is better)',
      'latency.min': 'milliseconds (less is better)',
      'latency.p50': 'milliseconds (less is better)',
      'latency.p99': 'milliseconds (less is better)',
      'requests.max': 'requests/second (higher is better)',
      'requests.min': 'requests/second (higher is better)',
      'requests.p50': 'requests/second (higher is better)',
      'requests.p99': 'requests/second (higher is better)',
      'throughput.max': 'bytes/second (higher is better)',
      'throughput.min': 'bytes/second (higher is better)',
      'throughput.p50': 'bytes/second (higher is better)',
      'throughput.p99': 'bytes/second (higher is better)',
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
