// @ts-check

const Edge = require('..')
const { join } = require('path')
const http = require('http')

const edge = new Edge()

http.createServer((req, res) => {
  edge.mount(join(__dirname, './views'))
  res.end(edge.render('user', { title: 'Hello' }))
}).listen(3000)