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
import { Loader } from '../src/Loader'
import { Compiler } from '../src/Compiler'

const tags = {
  if: class If {
    public static block = true
    public static seekable = true
    public static tagName = 'if'
    public static compile (): void {
    }
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
    assert.equal(compiler.compile('foo', false).template, `(function (template, ctx) {
  let out = ''
  out += 'Hello '
  out += \`\${ctx.escape(ctx.resolve('username'))}\`
  return out
})(template, ctx)`)
  })

  test('save template to cache', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello {{ username }}')
    const loader = new Loader()
    loader.mount('default', viewsDir)

    const compiler = new Compiler(loader, tags)
    assert.equal(compiler.compile('foo', false), compiler['cacheStore'].get(join(viewsDir, 'foo.edge')))
  })

  test('save template and presenter both to the cache', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello {{ username }}')
    await fs.outputFile(join(viewsDir, 'foo.presenter.js'), 'module.exports = class Foo {}')
    const loader = new Loader()
    loader.mount('default', viewsDir)

    const compiler = new Compiler(loader, tags)
    compiler.compile('foo', false)
    assert.equal(compiler['cacheStore'].get(join(viewsDir, 'foo.edge'))!.Presenter!['name'], 'Foo')
  })

  test('do not cache when disabled', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello {{ username }}')
    const loader = new Loader()
    loader.mount('default', viewsDir)

    const compiler = new Compiler(loader, tags, false)
    compiler.compile('foo', false)
    assert.isUndefined(compiler['cacheStore'].get(join(viewsDir, 'foo.edge')))
  })

  test('compile template as inline', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello {{ username }}')
    const loader = new Loader()
    loader.mount('default', viewsDir)

    const compiler = new Compiler(loader, tags)
    assert.equal(compiler.compile('foo', true).template, `
  let out = ''
  out += 'Hello '
  out += \`\${ctx.escape(ctx.resolve('username'))}\`
  return out`)
  })

  test('do not load presenter when inline', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello {{ username }}')
    await fs.outputFile(join(viewsDir, 'foo.presenter.js'), '')
    const loader = new Loader()
    loader.mount('default', viewsDir)

    const compiler = new Compiler(loader, tags)
    assert.isUndefined(compiler.compile('foo', true).Presenter)
  })
})
