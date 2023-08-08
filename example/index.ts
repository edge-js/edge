import { Edge } from '../index.js'
import { join } from 'node:path'
import { createServer } from 'node:http'
import { getDirname } from '@poppinss/utils'
import { migrate } from '../src/migrate/plugin.js'

const edge = Edge.create()
edge.use(migrate)
edge.mount(join(getDirname(import.meta.url), 'views'))

class Base {
  isModel = true
  foo = true
}

class User extends Base {
  attributes = {
    username: 'virk',
    email: 'virk@adonisjs.com',
    isAdmin: true,
    profile: {
      avatarUrl: 'foo',
    },
    lastLoginAt: null,
  }

  parent!: User
  get username() {
    return this.attributes.username
  }

  toJSON() {
    return {}
  }
}

const user = new User()
user.parent = user

createServer(async (_req, res) => {
  res.writeHead(200, { 'content-type': 'text/html' })
  const html = await edge.render('welcome', {
    user: user,
  })
  console.log(html)
  res.end(html)
}).listen(3000, () => {
  console.log('Listening on 127.0.0.1:3000')
})
