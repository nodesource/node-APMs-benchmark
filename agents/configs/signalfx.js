'use strict'

const accessToken = 'ACCESS_TOKEN'

module.exports = {
  collect: {
    accessToken,
    interval: 3000,
    ingestEndpoint: '<ingest metrics endpoint>' // 'https://ingest.eu0.signalfx.com'
  },
  tracing: {
    accessToken,
    service: '<service name>',
    tags: {
      '<tag_name>': '<tag_value>'
    },
    url: '<ingest tracing endpoint>' // 'https://ingest.eu0.signalfx.com/v2/trace'
  }
}
