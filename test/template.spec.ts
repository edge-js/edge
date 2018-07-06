/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import * as fs from 'fs-extra'

import { join } from 'path'

import { Template } from '../src/Template'
import { Compiler } from '../src/Compiler'
import { Loader } from '../src/Loader'

const viewsDir = join(__dirname, 'views')
const tags = {
  if: class If {
    public static block = true
    public static seekable = true
    public static selfclosed = false
    public static tagName = 'if'
  },
}

const loader = new Loader()
loader.mount('default', viewsDir)
const compiler = new Compiler(loader, tags, false)

test.group('Template', (group) => {
  group.afterEach(async () => {
    await fs.remove(viewsDir)
  })

  test('run template using the given state', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello {{ username }}')
    const output = new Template(compiler, {}, {}).render('foo', { username: 'virk' })
    assert.equal(output.trim(), 'Hello virk')
  })

  test('run template with custom presenter', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello {{ getUsername() }}')
    await fs.outputFile(join(viewsDir, 'foo.presenter.js'), `module.exports = class MyPresenter {
      constructor (state) {
        this.state = state
      }

      getUsername () {
        return this.state.username.toUpperCase()
      }
    }`)

    const output = new Template(compiler, {}, {}).render('foo', { username: 'virk' })
    assert.equal(output.trim(), 'Hello VIRK')
  })

  test('run template with shared state', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello {{ getUsername() }}')
    await fs.outputFile(join(viewsDir, 'foo.presenter.js'), `module.exports = class MyPresenter {
      constructor (state) {
        this.state = state
      }

      getUsername (ctx) {
        return ctx.resolve('username').toUpperCase()
      }
    }`)

    const output = new Template(compiler, { username: 'virk' }, {}).render('foo', {})
    assert.equal(output.trim(), 'Hello VIRK')
  })
})
