'use strict'

const fs = require('fs')
const split2 = require('split2')
const { ltsNameFromVersion } = require('./helper')

const linesWhiteList = [
  'DATADOG TRACER CONFIGURATION'
]

function parseJSON (line) {
  if (linesWhiteList.every(l => !line.startsWith(l))) {
    try {
      const parsed = JSON.parse(line)
      if (parsed.name !== '@instana/collector') { return parsed }
    } catch (e) {
      // do nothing
    }
  }
}

function summarize (results) {
  const summary = {}
  Object.keys(results).forEach(agent => {
    Object.keys(results[agent]).forEach(runtime => {
      Object.keys(results[agent][runtime]).forEach(stat => {
        const id = `${agent}:${runtime}`
        const data = results[agent][runtime][stat]
        let total = 0
        let avg = 0

        data.forEach(record => {
          total += record
        })

        avg = total / data.length
        if (!summary[stat]) {
          summary[stat] = { avg: [], runs: [] }
        }

        summary[stat].avg.push([id, avg])
        summary[stat].runs.push([id, data])
      })
    })
  })

  return summary
}

async function parse (basePath, script) {
  return new Promise((resolve) => {
    const results = {}
    fs.createReadStream(`${basePath}/logs/${script}.log`)
      .pipe(split2(parseJSON))
      .on('data', entry => {
        if (!results[entry.name]) {
          results[entry.name] = {}
        }

        const runtime = entry.nsolid
          ? `ns-${entry.nsolid}-${ltsNameFromVersion(entry.version)}`
          : `node-${entry.version}`
        if (!results[entry.name][runtime]) {
          results[entry.name][runtime] = {}
        }

        const location = results[entry.name][runtime]

        Object.keys(entry).forEach(k => {
          if (['name', 'version', 'nsolid'].includes(k)) {
            return
          }

          if (!location[k]) {
            location[k] = [entry[k]]
          } else {
            location[k].push(entry[k])
          }
        })
      }).on('end', () => {
        resolve(summarize(results))
      })
  })
}

module.exports = {
  parse
}
