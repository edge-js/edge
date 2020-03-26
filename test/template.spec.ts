/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import test from 'japa'
import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'

import { Loader } from '../src/Loader'
import { Context } from '../src/Context'
import { Template } from '../src/Template'
import { Compiler } from '../src/Compiler'

const tags = {}
const fs = new Filesystem(join(__dirname, 'views'))

const loader = new Loader()
loader.mount('default', fs.basePath)
const compiler = new Compiler(loader, tags, false)

test.group('Template', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('run template using the given state', async (assert) => {
    await fs.add('foo.edge', 'Hello {{ username }}')
    const output = new Template(compiler, {}, {}).render('foo', { username: 'virk' })
    assert.equal(output.trim(), 'Hello virk')
  })

  test('run template with shared state', async (assert) => {
    await fs.add('foo.edge', 'Hello {{ getUsername() }}')
    const output = new Template(compiler, { username: 'virk' }, {
      getUsername () {
        return this.username.toUpperCase()
      },
    }).render('foo', {})
    assert.equal(output.trim(), 'Hello VIRK')
  })

  test('run partial inside existing state', async (assert) => {
    await fs.add('foo.edge', 'Hello {{ username }}')
    const template = new Template(compiler, {}, {})

    const output = template.renderInline('foo')(template, { username: 'virk' }, new Context())
    assert.equal(output.trim(), 'Hello virk')
  })

  test('pass local variables to inline templates', async (assert) => {
    await fs.add('foo.edge', 'Hello {{ user.username }}')
    const template = new Template(compiler, {}, {})

    const user = { username: 'virk' }
    const output = template.renderInline('foo', 'user')(template, {}, new Context(), user)
    assert.equal(output.trim(), 'Hello virk')
  })
})
