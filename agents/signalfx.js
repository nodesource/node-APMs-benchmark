'use strict'

const config = require('./configs/signalfx')

const SignalFxCollect = require('signalfx-collect')
const collect = new SignalFxCollect(config.collect)
collect.start()

// Uncomment this in case you want tracing enabled
// require('signalfx-tracing').init(config.tracing)
