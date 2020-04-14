import edge from '..'
import { join } from 'path'
import { createServer } from 'http'

edge.mount(join(__dirname, 'views'))

createServer((_req, res) => {
  res.writeHead(200, { 'content-type': 'text/html' })
  res.end(edge.render('welcome', {
    user: {
      username: 'virk',
      email: 'virk@adonisjs.com',
      isAdmin: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }))
}).listen(3000, () => {
  console.log('Listening on 127.0.0.1:3000')
})
