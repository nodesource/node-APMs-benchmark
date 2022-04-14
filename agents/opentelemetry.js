'use strict'

const api = require('@opentelemetry/api')
const { BatchSpanProcessor } = require('@opentelemetry/tracing')
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node')
const { registerInstrumentations } = require('@opentelemetry/instrumentation')
const { DnsInstrumentation } = require('@opentelemetry/instrumentation-dns')
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger')

const provider = new NodeTracerProvider()
provider.addSpanProcessor(new BatchSpanProcessor(new JaegerExporter()))
provider.register()

// Enable dns and http module autoinstrumentation
registerInstrumentations({
  instrumentations: [
    new DnsInstrumentation({
    }),
    new HttpInstrumentation({
    })
  ]
})

api.trace.getTracer()
// To be sure the DNS is properly patched
require('dns')
