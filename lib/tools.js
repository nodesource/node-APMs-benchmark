'use strict'

const { performance } = require('perf_hooks')

function getCPUUsage () {
  const { user, system } = process.cpuUsage()
  return ((user + system) / 1000) * 100 / performance.now()
}

function getELUUsage () {
  return performance.eventLoopUtilization().utilization * 100
}

function getMemoryUsage () {
  const mem = process.memoryUsage()
  Object.keys(mem).forEach(type => {
    mem[type] = mem[type] * 0.000001
  })
  return mem
}

module.exports = {
  getCPUUsage,
  getELUUsage,
  getMemoryUsage
}
