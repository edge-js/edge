// @ts-check

const { Edge } = require('..')
const Youch = require('youch')
const { join } = require('path')
const http = require('http')

const edge = new Edge({ cache: false })
edge.mount(join(__dirname, './views'))

http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html' })
  try {
    res.end(edge.render('user', { title: 'Hello', username: 'virk' }))
  } catch (error) {
    new Youch(error, req).toHTML().then((html) => {
      res.writeHead(500, { 'content-type': 'text/html' })
      res.end(html)
    })
  }
}).listen(3000)
