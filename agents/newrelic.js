const path = require('path')
process.env.NEW_RELIC_HOME = path.join(__dirname, './configs')
require('newrelic')
