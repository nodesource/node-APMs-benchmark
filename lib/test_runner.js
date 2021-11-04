'use strict'

const {
  BM_AGENT_NAME,
  TEST_NAME
} = process.env

if (process.send)
  process.send('ready')
require(`../agents/${BM_AGENT_NAME}`)
require(`../test/${TEST_NAME}`)
