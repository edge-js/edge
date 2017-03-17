'use strict'

const edge = new (require('../src/Edge'))()
const path = require('path')
edge.registerViews(path.join(__dirname, './'))
const template = require('./loop.compiled')

const data = {
  simple: {
    username: 'virk'
  },
  loop: {
    users: [{
      username: 'virk',
      age: 27
    }, {
      username: 'nikk',
      age: 26
    }]
  }
}

require('http').createServer((req, res) => {
  // const template = req.url === '/' ? 'simple' : req.url.replace(/^\/|\/$/, '')
  try {
    const output = edge.renderPreCompiled(template, data.loop)
    res.writeHead(200, {'content-type': 'text/html'})
    res.end(output)
  } catch (e) {
    console.log(e.stack)
    res.end(e.message)
  }
}).listen(3333)
