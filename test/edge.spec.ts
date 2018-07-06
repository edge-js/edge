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

import { Edge } from '../src/Edge'
import { Loader } from '../src/Loader'
import { Compiler } from '../src/Compiler'

const viewsDir = join(__dirname, 'views')

test.group('Template', (group) => {
  group.afterEach(async () => {
    Edge.clear()
    await fs.remove(viewsDir)
  })

  test('calling configure should setup the loader and compiler', (assert) => {
    Edge.configure({})
    assert.instanceOf(Edge.loader, Loader)
    assert.instanceOf(Edge.compiler, Compiler)
  })

  test('mount default disk', (assert) => {
    Edge.mount(viewsDir)
    assert.deepEqual(Edge.loader.mounted, { default: viewsDir })
  })

  test('mount named disk', (assert) => {
    Edge.mount('foo', viewsDir)
    assert.deepEqual(Edge.loader.mounted, { foo: viewsDir })
  })

  test('unmount named disk', (assert) => {
    Edge.mount('foo', viewsDir)
    Edge.unmount('foo')
    assert.deepEqual(Edge.loader.mounted, {})
  })

  test('register globals', (assert) => {
    Edge.global('foo', 'bar')
    assert.deepEqual(Edge['globals'].foo, 'bar')
  })

  test('add a custom tag to the tags list', (assert) => {
    class MyTag {
      public static tagName = 'mytag'
      public static block = true
      public static seekable = true
      public static selfclosed = true
    }
    Edge.tag(MyTag)

    Edge.configure({})
    assert.deepEqual(Edge.compiler['tags'].mytag, MyTag)
  })

  test('render a view using the static render method', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello {{ username }}')

    Edge.mount(viewsDir)
    assert.equal(Edge.render('foo', { username: 'virk' }).trim(), 'Hello virk')
  })

  test('pass locals to the view context', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), `Hello {{ username || 'guest' }}`)

    Edge.mount(viewsDir)
    const tmpl = Edge.newUp()
    tmpl.share({ username: 'nikk' })

    assert.equal(tmpl.render('foo', {}).trim(), 'Hello nikk')
    assert.equal(Edge.render('foo', {}).trim(), 'Hello guest')
  })
})
