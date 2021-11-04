'use strict'

const api = require('@opentelemetry/api')
const { BatchSpanProcessor } = require('@opentelemetry/tracing')
const { NodeTracerProvider } = require('@opentelemetry/node')
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger')

const provider = new NodeTracerProvider()
provider.addSpanProcessor(new BatchSpanProcessor(new JaegerExporter()))
provider.register()

// Enable http module autoinstrumentation
const httpInstrumentation = new HttpInstrumentation()
httpInstrumentation.enable()

api.trace.getTracer()
