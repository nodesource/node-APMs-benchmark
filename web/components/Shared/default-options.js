import * as Icons from '../Icons/Icons.js'

export const apmOpts = {
  title: 'APM\'s',
  icon: Icons.apm(),
  options: [
    {
      name: 'Appdynamics',
      value: 'appdynamics'
    },
    {
      name: 'OpenTelemetry',
      value: 'opentelemetry'
    },
    {
      name: 'Datadog',
      value: 'datadog'
    },
    {
      name: 'Vanilla Node (Noop)',
      value: 'noop'
    },
    {
      name: 'Instana',
      value: 'instana'
    },
    {
      name: 'New relic',
      value: 'newrelic'
    },
    {
      name: 'Dynatrace',
      value: 'dynatrace'
    },
    {
      name: 'SignalFX',
      value: 'signalfx'
    }
  ]
}

export const testsOpts = {
  title: 'Test suite',
  icon: Icons.test(),
  options: [
    {
      name: 'HTTP',
      value: 'http'
    },
    {
      name: 'HTTP loose loop',
      value: 'http_loose_loop'
    },
    {
      name: 'Basic',
      value: 'basic'
    },
    {
      name: 'Block',
      value: 'block'
    },
    {
      name: 'Express',
      value: 'express'
    },
    {
      name: 'Fastify',
      value: 'fastify'
    },
    {
      name: 'Hapi',
      value: 'hapi'
    }
  ]
}

export const metricsOpts = {
  title: 'Metrics',
  icon: Icons.metrics(),
  options: [
    {
      name: 'Loadtime',
      value: 'loadtime'
    },
    {
      name: 'RSS',
      value: 'rss'
    },
    {
      name: 'Heap total',
      value: 'heaptotal'
    },
    {
      name: 'Heap used',
      value: 'heapused'
    },
    {
      name: 'External',
      value: 'external'
    },
    {
      name: 'Uptime',
      value: 'uptime'
    },
    {
      name: 'ArrayBuffers',
      value: 'arraybuffers'
    }
  ]
}

export const graphOpts = {
  title: 'Graphs',
  icon: Icons.metrics(),
  options: [
    {
      name: 'Runtime',
      value: 'runtimes'
    },
    {
      name: 'APMs',
      value: 'apms'
    }
  ]
}
