'use strict'

const fs = require('fs')
const path = require('path')
const express = require('express')
const port = process.env.PORT || 3333
const cors = require('cors')

function makeReadable (idx) {
  return Object.keys(idx).sort().map(id => {
    const meta = idx[id]
    const d = (new Date(parseInt(id))).toLocaleString().replace(/\//g, '-')
    const mem = parseInt(meta.totalmem / 1073741824)
    const speed = parseInt(meta.cpus[0].speed / 100) / 10
    return [id, `[${d}] - ${meta.type} ${meta.arch} (${meta.cpus.length} core ${speed}Ghz ${mem}GB)`]
  })
}

async function start (baseDir) {
  const app = express()
  app.use(cors())

  const publicDir = path.join(baseDir, 'public')
  const buildDir = path.join(__dirname, '../build')
  const dataDir = path.join(publicDir, 'data')
  const runIndex = fs.readdirSync(dataDir, { withFileTypes: true })
    .filter(entry => {
      return (entry.isDirectory() &&
        entry.name.match(/^[0-9]{13}/) &&
        fs.existsSync(path.join(dataDir, entry.name, 'meta.json')))
    }).reduce((p, c) => {
      p[c.name] = require(path.join(dataDir, c.name, 'meta.json'))
      return p
    }, {})

  app.use(express.static(publicDir))
  app.use(express.static(buildDir))

  app.get('/', (req, res) => {
    if (req.is('json')) {
      const id = req.query.runId
      const meta = runIndex[id]
      res.send(meta)
      return
    }

    const indexFile = path.resolve(__dirname, '../build/index.html')
    res.sendFile(indexFile)
  })

  app.get('/runs', (req, res) => res.send(makeReadable(runIndex).reverse()))

  app.listen(port)
  console.log(`Server running on port ${port}`)
}

module.exports = {
  start
}
