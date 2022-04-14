'use strict'

module.exports = {
  saas: 'NSOLID_SAAS_TOKEN',
  tracingEnabled: true,
  datadog: {
    zone: 'eu or us',
    key: 'DATADOG_KEY',
    url: 'http://localhost:4318' // URL of traces OTLP collector
  }
}
