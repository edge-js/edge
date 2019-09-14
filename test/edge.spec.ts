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

import { Edge } from '../src/Edge'
import { Loader } from '../src/Loader'

const fs = new Filesystem(join(__dirname, 'views'))

test.group('Edge', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('mount default disk', (assert) => {
    const edge = new Edge(new Loader())
    edge.mount(fs.basePath)
    assert.deepEqual(edge.loader.mounted, { default: fs.basePath })
  })

  test('mount named disk', (assert) => {
    const edge = new Edge(new Loader())
    edge.mount('foo', fs.basePath)
    assert.deepEqual(edge.loader.mounted, { foo: fs.basePath })
  })

  test('unmount named disk', (assert) => {
    const edge = new Edge(new Loader())
    edge.mount('foo', fs.basePath)
    edge.unmount('foo')
    assert.deepEqual(edge.loader.mounted, {})
  })

  test('register globals', (assert) => {
    const edge = new Edge(new Loader())
    edge.global('foo', 'bar')
    assert.deepEqual(edge['_globals'].foo, 'bar')
  })

  test('add a custom tag to the tags list', (assert) => {
    const edge = new Edge(new Loader())

    class MyTag {
      public static tagName = 'mytag'
      public static block = true
      public static seekable = true
      public static compile (): void {
      }
    }

    edge.registerTag(MyTag)
    assert.deepEqual(edge.compiler['_tags'].mytag, MyTag)
  })

  test('render a view using the render method', async (assert) => {
    const edge = new Edge(new Loader())
    await fs.add('foo.edge', 'Hello {{ username }}')

    edge.mount(fs.basePath)
    assert.equal(edge.render('foo', { username: 'virk' }).trim(), 'Hello virk')
  })

  test('pass locals to the view context', async (assert) => {
    const edge = new Edge(new Loader())
    await fs.add('foo.edge', `Hello {{ username || 'guest' }}`)

    edge.mount(fs.basePath)

    const tmpl = edge.getRenderer()
    tmpl.share({ username: 'nikk' })

    assert.equal(tmpl.render('foo', {}).trim(), 'Hello nikk')
    assert.equal(edge.render('foo', {}).trim(), 'Hello guest')
  })

  test('register a template as a string', async (assert) => {
    const edge = new Edge(new Loader())

    edge.registerTemplate('foo', {
      template: `Hello {{ username }}`,
    })

    assert.equal(edge.render('foo', { username: 'virk' }).trim(), 'Hello virk')
  })

  test('register a template on a named disk', async (assert) => {
    const edge = new Edge(new Loader())
    edge.mount('hello', fs.basePath)

    edge.registerTemplate('hello::foo', {
      template: `Hello {{ username }}`,
    })

    assert.equal(edge.render('hello::foo', { username: 'virk' }).trim(), 'Hello virk')
  })

  test('pass absolute path of template to lexer errors', async (assert) => {
    assert.plan(1)
    await fs.add('foo.edge', '@if(1 + 1)')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const edge = new Edge(new Loader())
    edge.mount(fs.basePath)

    try {
      edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(stack.split('\n')[1].trim(), `at (${join(fs.basePath, 'foo.edge')}:1:4)`)
    }
  })

  test('pass absolute path of template to parser errors', async (assert) => {
    assert.plan(1)
    await fs.add('foo.edge', 'Hello {{ a,:b }}')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const edge = new Edge(new Loader())
    edge.mount(fs.basePath)

    try {
      edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(stack.split('\n')[1].trim(), `at (${join(fs.basePath, 'foo.edge')}:1:11)`)
    }
  })

  test('pass absolute path of layout to lexer errors', async (assert) => {
    assert.plan(1)
    await fs.add('foo.edge', `@layout('bar')`)
    await fs.add('bar.edge', `@if(username)`)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const edge = new Edge(new Loader())
    edge.mount(fs.basePath)

    try {
      edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(stack.split('\n')[1].trim(), `at (${join(fs.basePath, 'bar.edge')}:1:4)`)
    }
  })

  test('pass absolute path of layout to parser errors', async (assert) => {
    assert.plan(1)
    await fs.add('foo.edge', `@layout('bar')`)
    await fs.add('bar.edge', `{{ a:b }}`)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const edge = new Edge(new Loader())
    edge.mount(fs.basePath)

    try {
      edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(stack.split('\n')[1].trim(), `at (${join(fs.basePath, 'bar.edge')}:1:3)`)
    }
  })

  test('pass absolute path of partial to lexer errors', async (assert) => {
    assert.plan(1)
    await fs.add('foo.edge', `@include('bar')`)
    await fs.add('bar.edge', `@if(username)`)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const edge = new Edge(new Loader())
    edge.mount(fs.basePath)

    try {
      edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(stack.split('\n')[1].trim(), `at (${join(fs.basePath, 'bar.edge')}:1:4)`)
    }
  })

  test('pass absolute path of partial to parser errors', async (assert) => {
    assert.plan(1)
    await fs.add('foo.edge', `@include('bar')`)
    await fs.add('bar.edge', `{{ a:b }}`)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const edge = new Edge(new Loader())
    edge.mount(fs.basePath)

    try {
      edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(stack.split('\n')[1].trim(), `at (${join(fs.basePath, 'bar.edge')}:1:3)`)
    }
  })

  test('pass absolute path of component to lexer errors', async (assert) => {
    assert.plan(1)
    await fs.add('foo.edge', `@!component('bar')`)
    await fs.add('bar.edge', `@if(username)`)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const edge = new Edge(new Loader())
    edge.mount(fs.basePath)

    try {
      edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(stack.split('\n')[1].trim(), `at (${join(fs.basePath, 'bar.edge')}:1:4)`)
    }
  })

  test('pass absolute path of component to parser errors', async (assert) => {
    assert.plan(1)
    await fs.add('foo.edge', `@!component('bar')`)
    await fs.add('bar.edge', `{{ a:b }}`)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const edge = new Edge(new Loader())
    edge.mount(fs.basePath)

    try {
      edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(stack.split('\n')[1].trim(), `at (${join(fs.basePath, 'bar.edge')}:1:3)`)
    }
  })
})
