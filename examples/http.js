'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const http = require('http')
const edge = new (require('../src/Edge'))
const path = require('path')
const nunjucks = require('nunjucks')

nunjucks.configure(path.join(__dirname))

edge.mountDefault(path.join(__dirname))

http.createServer((req, res) => {
  const url = req.url
  const template = url === '/' ? 'simple' : url
  try {
    const output = edge.render(template, {username: 'virk', users: [{username: 'virk'}, {username: 'nikk'}]})
    res.writeHead(200, {'content-type': 'text/html'})
    res.write(output)
    res.end()
  } catch (e) {
    console.log(e)
    res.writeHead(500)
    res.write(e.message)
    res.end()
  }
}).listen(3000)

