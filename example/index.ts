import edge from '../index'
import { join } from 'path'
import { createServer } from 'http'

edge.mount(join(__dirname, 'views'))

class Base {
  public isModel = true
  public foo = true
}

class User extends Base {
  public attributes = {
    username: 'virk',
    email: 'virk@adonisjs.com',
    isAdmin: true,
    profile: {
      avatarUrl: 'foo',
    },
    lastLoginAt: null,
  }

  public parent: User
  public get username() {
    return this.attributes.username
  }

  public toJSON() {
    return {}
  }
}

const user = new User()
user.parent = user

// edge.processor.process('compiled', ({ compiled, path }) => {
// 	console.log(path)
// 	console.log(compiled)
// })

createServer((_req, res) => {
  res.writeHead(200, { 'content-type': 'text/html' })
  res.end(
    edge.render('welcome', {
      user: user,
    })
  )
}).listen(3000, () => {
  console.log('Listening on 127.0.0.1:3000')
})
