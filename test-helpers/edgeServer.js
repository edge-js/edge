'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const http = require('http')
const nodeReq = require('node-req')
const edge = require('../index')

module.exports = (viewsLocation, port) => {
  edge.registerViews(viewsLocation)

  http.createServer((req, res) => {
    const query = nodeReq.get(req)
    const url = nodeReq.url(req)
    try {
      const output = edge.render(url, query)
      res.writeHead(200, {'Content-type': 'text/html'})
      res.write(output)
      res.end()
    } catch (e) {
      res.writeHead(200, {'Content-type': 'application/json'})
      res.write(JSON.stringify({
        message: e.message,
        stack: e.stack,
        name: e.name,
        code: e.code
      }))
      res.end()
    }
  }).listen(port)
}
