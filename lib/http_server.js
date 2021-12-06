'use strict'

const http = require('http')

const port = process.env.PORT || 9999

const server = http.createServer((req, res) => {
  res.write('Hello World!')
  res.end()
})

server.listen(port, () => {
  process.send('ready')
})
