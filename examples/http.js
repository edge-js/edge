'use strict'

const path = require('path')
const edge = require('../index')
const viewsPath = path.join(__dirname, '/views')
edge.registerViews(viewsPath)
edge.configure({cache: false})
edge.registerPresenters(path.join(__dirname, '/presenters'))

require('http').createServer((req, res) => {
  const template = `${req.url}/index`
  const presenter = req.url.replace(/\//g, '')
  try {
    const start = process.hrtime()
    const output = edge.presenter(presenter).render(template)
    const diff = process.hrtime(start)
    console.log(`took \x1b[33m${(diff[0] * 1e9 + diff[1]) / 1e6}ms\x1b[0m to render ${template} view`)
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
