#!/usr/bin/env node

'use strict'

const { mkdtempSync } = require('fs')
const path = require('path')
const debug = require('debug')('benchmark')
const inquirer = require('inquirer')
const open = require('open')
const {
  AgentOpts,
  getNodeVersions,
  getNodeURL,
  getNSolidVersion,
  runHttpTests,
  setupNodeVersion,
  setupNSolidVersion,
  usesApms,
  usesNSolid
} = require('../lib/helper')
const { capture } = require('../lib/capture')
const { run } = require('../lib/run')
const server = require('../lib/server')

async function promptRuntimes () {
  const res = await inquirer.prompt([
    {
      type: 'list',
      name: 'branch',
      message: 'Please choose the LTS branch to be used as baseline: ',
      choices: [
        {
          name: 'v12 (Erbium)',
          value: 12
        },
        {
          name: 'v14 (Fermium)',
          value: 14
        },
        {
          name: 'v16 (Gallium)',
          value: 16
        }
      ],
      validate: (input) => {
        if (input.length === 0) {
          return 'Choose at least one option'
        }

        return true
      }
    }
  ])

  const choices = await getNodeVersions(res.branch)
  const version = (await inquirer.prompt([
    {
      type: 'list',
      name: 'version',
      message: 'Please choose a nodejs version to use as baseline: ',
      choices
    }
  ])).version

  return [{
    nodeVersion: version,
    nodeUrl: getNodeURL(version)
  }]
}

async function promptTests () {
  const opts = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'tests',
      message: 'Please choose the tests to run: ',
      choices: [
        'apollo-graphql',
        'basic',
        'block',
        'express',
        'express-graphql',
        'fastify',
        'fastify-mercurius-graphql',
        'hapi',
        'http',
        'http_loose_loop',
        'http_client'
      ],
      validate: (input) => {
        if (input.length === 0) {
          return 'Choose at least one option'
        }

        return true
      }
    }
  ])
  return opts.tests
}

async function promptIterations () {
  const opts = await inquirer.prompt([
    {
      type: 'list',
      name: 'iterations',
      message: 'Please select the number of iterations per test: ',
      choices: [
        1,
        2,
        3,
        5,
        10
      ]
    }
  ])
  return opts.iterations
}

async function promptHttpDuration () {
  const opts = await inquirer.prompt([
    {
      type: 'list',
      name: 'httpDuration',
      message: 'Please select the duration of the http tests: ',
      choices: [
        10,
        20,
        30,
        60,
        120
      ]
    }
  ])
  return opts.httpDuration
}

async function promptAgents () {
  const opts = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'agents',
      message: 'Please choose the agent configurations: ',
      choices: [
        {
          name: 'Vanilla Node',
          value: AgentOpts.NODE
        },
        {
          name: 'NSolid',
          value: AgentOpts.NSOLID
        },
        {
          name: 'NSolid with tracing',
          value: AgentOpts.NSOLID_TRACING
        },
        {
          name: 'Other APM\'s',
          value: AgentOpts.APM
        },
        {
          name: 'NSolid + APM\'s',
          value: AgentOpts.NSOLID_APM
        }
      ],
      validate: (input) => {
        if (input.length === 0) {
          return 'Choose at least one option'
        }

        return true
      }
    }
  ])

  return opts.agents
}

async function promptAPMs () {
  const opts = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'apms',
      message: 'Please choose the APM\'s to test: ',
      choices: [
        {
          name: 'AppDynamics',
          value: 'appdynamics'
        },
        {
          name: 'Datadog',
          value: 'datadog'
        },
        {
          name: 'Dynatrace',
          value: 'dynatrace'
        },
        {
          name: 'Instana',
          value: 'instana'
        },
        {
          name: 'New Relic',
          value: 'newrelic'
        },
        {
          name: 'OpenTelemetry',
          value: 'opentelemetry'
        },
        {
          name: 'SignalFx',
          value: 'signalfx'
        }
      ],
      validate: (input) => {
        if (input.length === 0) {
          return 'Choose at least one option'
        }

        return true
      }
    }
  ])

  return opts.apms
}

async function setupRuntimes (runtimes) {
  // Create tmpdir where all the runtimes will be setup
  //  tmpDir
  //    |-----v12.22.1
  //             |----- node
  //             |----- nsolid
  const dir = mkdtempSync('/tmp/benchmark-')
  for (const runtime of runtimes) {
    const { nodeVersion, nodeUrl } = runtime
    await setupNodeVersion(nodeVersion, nodeUrl, dir)
    if (runtime.nsolidVersion) {
      await setupNSolidVersion(nodeVersion,
        runtime.nsolidVersion,
        runtime.nsolidUrl,
        dir)
    }
  }

  return dir
}

async function main () {
  const options = {}
  options.runtimes = await promptRuntimes()
  options.tests = await promptTests()
  options.iterations = await promptIterations()
  if (runHttpTests(options.tests)) {
    options.httpDuration = await promptHttpDuration()
  }
  options.agents = await promptAgents()
  if (usesApms(options.agents)) {
    options.apms = await promptAPMs()
  }

  if (usesNSolid(options.agents)) {
    for (const runtime of options.runtimes) {
      const nsolid = await getNSolidVersion(runtime.nodeVersion)
      if (nsolid) {
        runtime.nsolidVersion = nsolid.version
        runtime.nsolidUrl = nsolid.url
      } else {
        // print some warning because no nsolid version available corresponding
        // to the LTS node version
      }
    }
  }

  options.dir = await setupRuntimes(options.runtimes)
  debug(options)
  await run(options)
  const id = await capture(options)
  await server.start(path.join(`${__dirname}`, '..', 'reports'))
  open(`http://127.0.0.1:3333/?runId=${id}`)
}

main()
