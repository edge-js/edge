'use strict'

const path = require('path')
const edge = require('../index')
const viewsPath = path.join(__dirname, '/views')
edge.registerViews(viewsPath)
edge.registerPresenters(path.join(__dirname, '/presenters'))

require('http').createServer((req, res) => {
  const template = `${req.url}/index`
  try {
    const output = edge.presenter(req.url.replace(/\//g, '')).render(template)
    res.writeHead(200, { 'Content-type': 'text/html' })
    res.write(output)
    res.end()
  } catch (e) {
    res.writeHead(500, {'Content-type': 'application/json'})
    res.write(JSON.stringify({
      message: e.message,
      stack: e.stack,
      name: e.name,
      code: e.code
    }))
    res.end()
  }
}).listen(3333)
