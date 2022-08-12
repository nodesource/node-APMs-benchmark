'use strict'

const { exec, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const util = require('util')
const { green, bold } = require('colorette')
const debug = require('debug')('run')
const {
  AgentOpts,
  GraphQLTests,
  HTTPClientTests,
  HTTPTests
} = require('./helper')

const AUTOCANNON = path.join(__dirname, '..', 'node_modules/autocannon/autocannon.js')
const PORT = 3000

function writeAutocannonStats (stats, fileStream, name, version, nsolid) {
  const result = {
    name,
    version,
    nsolid,
    'latency.max': stats.latency.max,
    'latency.min': stats.latency.min,
    'latency.p50': stats.latency.p50,
    'latency.p99': stats.latency.p99,
    'requests.max': stats.requests.max,
    'requests.min': stats.requests.min,
    'requests.p50': stats.requests.p50,
    'requests.p99': stats.requests.p99,
    'throughput.max': stats.throughput.max,
    'throughput.min': stats.throughput.min,
    'throughput.p50': stats.throughput.p50,
    'throughput.p99': stats.throughput.p99,
    errors: stats.errors
  }

  fileStream.write(JSON.stringify(result) + '\n')
}

function logRun (it, test, runtime, apm) {
  process.stdout.clearLine()
  process.stdout.write(`${bold('Test')}: ${green(test)}. ${bold('Iteration')} #${green(it)}. ${bold('Runtime')}: ${green(runtime)}. ${bold('APM')}: ${green(apm)}\r`)
}

const sleep = util.promisify(setTimeout)

async function runTest (binaryPath, test, fileStream, opts) {
  await sleep(1000)
  return new Promise((resolve, reject) => {
    let stats
    debug('runTest', binaryPath, path.join(__dirname, 'test_runner'), opts.spawnOpts)

    if (HTTPClientTests.includes(test)) {
      const server = spawn(process.execPath, [path.join(__dirname, 'http_server')], { env: { PORT }, stdio: ['ipc', 'pipe', 'pipe'] })
      server.on('message', () => {
        const proc = spawn(binaryPath, [path.join(__dirname, 'test_runner')], opts.spawnOpts)
        proc.stdout.on('data', (d) => {
          fileStream.write(d)
        })

        proc.on('message', (msg) => {
          if (msg.type === 'process:msg' && msg.data.exit) {
            debug('runTest', 'process:msg exit')
            proc.kill()
          }
        });

        proc.on('close', () => {
          debug('runTest', 'proc close')
          server.kill()
          resolve(stats)
        })
      })

      return
    }

    const proc = spawn(binaryPath, [path.join(__dirname, 'test_runner')], opts.spawnOpts)
    proc.stdout.on('data', (d) => {
      fileStream.write(d)
    })

    proc.on('message', (msg) => {
      if (msg.type === 'process:msg' && msg.data.exit) {
        debug('runTest', 'process:msg exit')
        proc.kill()
      }
    });

    proc.on('exit', () => {
      debug('runTest', 'proc exit')
      resolve(stats)
    })

    if (HTTPTests.includes(test)) {
      proc.on('message', () => {
        exec(`${AUTOCANNON} -d ${opts.httpDuration} --json http://localhost:${PORT}`, (err, stdout) => {
          debug('runTest', 'autocannon exit', err, stdout)
          if (!err) {
            stats = JSON.parse(stdout)
          }

          proc.kill('SIGUSR1')
          if (err) {
            reject(err)
          }
        })
      })
    } else if (GraphQLTests.includes(test)) {
      proc.on('message', () => {
        exec(`${AUTOCANNON} -d ${opts.httpDuration} -b '{"query": "{ add(x:1, y:2) }" }' -H 'Content-Type: application/json' --json http://localhost:${PORT}`, (err, stdout) => {
          if (!err) {
            stats = JSON.parse(stdout)
          }

          proc.kill('SIGUSR1')
          if (err) {
            reject(err)
          }
        })
      })
    }
  })
}

async function run (opts) {
  const logsPath = `${opts.dir}/logs`
  await fs.promises.mkdir(logsPath)
  for (const test of opts.tests) {
    const fileStream = fs.createWriteStream(
      path.join(logsPath, `${test}.log`), { flags: 'w' })
    for (let i = 0; i < opts.iterations; ++i) {
      for (const runtime of opts.runtimes) {
        const nodeVersion = runtime.nodeVersion
        const dirname = path.join(opts.dir, nodeVersion)
        const options = {
          httpDuration: opts.httpDuration,
          spawnOpts: {
            env: {
              BM_AGENT_NAME: 'noop',
              HOME: process.env.HOME,
              LOGS_PATH: logsPath,
              PORT,
              TEST_NAME: test,
              DURATION: opts.httpDuration
            },
            stdio: ['ipc', 'pipe', 'pipe']
          }
        }

        const nodePath = path.join(dirname, 'node')
        const nsolidPath = path.join(dirname, 'nsolid')
        if (opts.agents.includes(AgentOpts.NODE)) {
          logRun(i + 1, test, 'node', 'noop')
          const stats = await runTest(nodePath, test, fileStream, options)
          if (stats) {
            writeAutocannonStats(stats, fileStream, 'noop', nodeVersion, false)
          }
        }

        if (opts.apms) {
          for (const apm of opts.apms) {
            options.spawnOpts.env.BM_AGENT_NAME = apm
            logRun(i + 1, test, 'node', apm)
            const stats =
              await runTest(nodePath, test, fileStream, options)
            if (stats) {
              writeAutocannonStats(stats, fileStream, apm, nodeVersion, false)
            }

            if (opts.agents.includes(AgentOpts.NSOLID_APM)) {
              logRun(i + 1, test, 'nsolid', apm)
              const stats =
                await runTest(nsolidPath, test, fileStream, options)
              if (stats) {
                writeAutocannonStats(
                  stats, fileStream, apm, nodeVersion, runtime.nsolidVersion)
              }
            }
          }
        }

        if (opts.agents.includes(AgentOpts.NSOLID)) {
          options.spawnOpts.env.BM_AGENT_NAME = 'nsolid'
          logRun(i + 1, test, 'nsolid', 'nsolid')
          const stats = await runTest(nsolidPath, test, fileStream, options)
          if (stats) {
            writeAutocannonStats(
              stats, fileStream, 'nsolid', nodeVersion, runtime.nsolidVersion)
          }
        }

        if (opts.agents.includes(AgentOpts.NSOLID_TRACING)) {
          options.spawnOpts.env.BM_AGENT_NAME = 'nsolid_tracing'
          logRun(i + 1, test, 'nsolid', 'nsolid_tracing')
          const stats = await runTest(nsolidPath, test, fileStream, options)
          if (stats) {
            writeAutocannonStats(
              stats, fileStream, 'nsolid_tracing', nodeVersion, runtime.nsolidVersion)
          }
        }

        if (opts.agents.includes(AgentOpts.NSOLID_OTLP)) {
          for (const apm of opts.otlp_apms) {
            options.spawnOpts.env.BM_AGENT_NAME = apm
            logRun(i + 1, test, 'nsolid', apm)
            const stats = await runTest(nsolidPath, test, fileStream, options)
            if (stats) {
              writeAutocannonStats(
                stats, fileStream, apm, nodeVersion, runtime.nsolidVersion)
            }
          }
        }
      }
    }

    fileStream.end()
  }

  process.stdout.write('\n')
}

module.exports = {
  run
}
