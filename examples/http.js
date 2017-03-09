'use strict'

const edge = new (require('../src/Edge'))
const path = require('path')
edge.registerViews(path.join(__dirname, './'))

const data = {
  simple: {
    username: 'virk'
  },
  loop: {
    users: ['virk', 'nikk']
  }
}

require('http').createServer((req, res) => {
  const template = req.url === '/' ? 'simple' : req.url.replace(/^\/|\/$/, '')
  console.log(template)
  try {
    const ouput = edge.render(template, data[template])
    res.writeHead(200, {'content-type': 'text/html'})
    res.end(ouput)
  } catch (e) {
    console.log(e.stack)
    res.end(e.message)
  }
}).listen(3333)
