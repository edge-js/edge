// @ts-check

const edge = require('..').default
const Youch = require('youch')
const { join } = require('path')
const http = require('http')

http.createServer((req, res) => {
  edge.mount(join(__dirname, './views'))
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
