'use strict'

try {
  const nsolid = require('nsolid')
  nsolid.start({
    ...require('./configs/nsolid_datadog')
  })
} catch (e) {
}
