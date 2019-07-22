/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { join } from 'path'
import * as test from 'japa'
import { Filesystem } from '@poppinss/dev-utils'

import { Loader } from '../src/Loader'
import { Compiler } from '../src/Compiler'

const tags = {}

const fs = new Filesystem(join(__dirname, 'views'))

test.group('Compiler', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('compile template', async (assert) => {
    await fs.add('foo.edge', 'Hello {{ username }}')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, tags)
    assert.equal(compiler.compile('foo', false).template, `(function (template, ctx) {
  let out = ''
  out += 'Hello '
  out += \`\${ctx.escape(ctx.resolve('username'))}\`
  return out
})(template, ctx)`)
  })

  test('save template to cache when is turned on', async (assert) => {
    await fs.add('foo.edge', 'Hello {{ username }}')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, tags, true)
    assert.equal(
      compiler.compile('foo', false),
      compiler['_cacheManager'].get(join(fs.basePath, 'foo.edge')),
    )
  })

  test('save template and presenter both to the cache when caching is turned on', async (assert) => {
    await fs.add('foo.edge', 'Hello {{ username }}')
    await fs.add('foo.presenter.js', 'module.exports = class Foo {}')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, tags, true)
    compiler.compile('foo', false)
    assert.equal(
      compiler['_cacheManager'].get(join(fs.basePath, 'foo.edge'))!.Presenter!['name'],
      'Foo',
    )
  })

  test('do not cache template when caching is turned off', async (assert) => {
    await fs.add('foo.edge', 'Hello {{ username }}')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, tags, false)
    compiler.compile('foo', false)
    assert.isUndefined(compiler['_cacheManager'].get(join(fs.basePath, 'foo.edge')))
  })

  test('do not wrap inline templates to a function', async (assert) => {
    await fs.add('foo.edge', 'Hello {{ username }}')
    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, tags)
    assert.equal(compiler.compile('foo', true).template, `
  let out = ''
  out += 'Hello '
  out += \`\${ctx.escape(ctx.resolve('username'))}\`
  return out`)
  })

  test('do not load presenter for inline templates', async (assert) => {
    await fs.add('foo.edge', 'Hello {{ username }}')
    await fs.add('foo.presenter.js', '')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, tags)
    assert.isUndefined(compiler.compile('foo', true).Presenter)
  })
})
