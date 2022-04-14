'use strict'

module.exports = {
  saas: 'NSOLID_SAAS_TOKEN',
  tracingEnabled: true,
  otlp: {
    otlp: {
      url: 'http://localhost:4318' // Otlp Collector URL
    }
  }
}
