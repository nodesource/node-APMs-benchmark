'use strict'

try {
  const nsolid = require('nsolid')
  nsolid.start({
    ...require('./configs/nsolid_otlp')
  })
} catch (e) {
}
