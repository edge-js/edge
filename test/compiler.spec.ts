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
import { EOL } from 'os'

import { join } from 'path'
import { Loader } from '../src/Loader'
import { Compiler } from '../src/Compiler'

const tags = {
  if: class If {
    public static block = true
    public static seekable = true
    public static selfclosed = false
  },
}
const viewsDir = join(__dirname, 'views')

test.group('Compiler', (group) => {
  group.afterEach(async () => {
    await fs.remove(viewsDir)
  })

  test('compile template', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello {{ username }}')
    const loader = new Loader()
    loader.mount('default', viewsDir)

    const compiler = new Compiler(loader, tags)
    assert.equal(compiler.compile('foo'), `(function (template, ctx) {
  let out = ''
  out += 'Hello '
  out += \`\${ctx.escape(ctx.resolve('username'))}\`
  out += '${EOL === '\n' ? '\\n' : '\\r\\n'}'
  return out
})(template, ctx)`)
  })

  test('save template to cache', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello {{ username }}')
    const loader = new Loader()
    loader.mount('default', viewsDir)

    const compiler = new Compiler(loader, tags)
    assert.equal(compiler.compile('foo'), compiler['cache'].get(join(viewsDir, 'foo.edge')))
  })

  test('do not cache when disabled', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello {{ username }}')
    const loader = new Loader()
    loader.mount('default', viewsDir)

    const compiler = new Compiler(loader, tags, false)
    compiler.compile('foo')
    assert.isUndefined(compiler['cache'].get(join(viewsDir, 'foo.edge')))
  })
})
