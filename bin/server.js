#!/usr/bin/env node

'use strict'

const path = require('path')
const server = require('../lib/server')

async function start () {
  await server.start(path.join(`${__dirname}`, '..', 'reports'))
}

start()
