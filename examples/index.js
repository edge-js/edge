// @ts-check

const edge = require('..').default
const { join } = require('path')
const http = require('http')

http.createServer((req, res) => {
  edge.mount(join(__dirname, './views'))
  res.writeHead(200, { 'content-type': 'text/html' })
  res.end(edge.render('user', { title: 'Hello' }))
}).listen(3000)
