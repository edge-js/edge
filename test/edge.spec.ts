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
import applyGlobals from '../src/Edge/globals'

const fs = new Filesystem(join(__dirname, 'views'))

test.group('Edge', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('mount default disk', (assert) => {
    const edge = new Edge()
    edge.mount(fs.basePath)
    assert.deepEqual(edge.loader.mounted, { default: fs.basePath })
  })

  test('mount named disk', (assert) => {
    const edge = new Edge()
    edge.mount('foo', fs.basePath)
    assert.deepEqual(edge.loader.mounted, { foo: fs.basePath })
  })

  test('unmount named disk', (assert) => {
    const edge = new Edge()
    edge.mount('foo', fs.basePath)
    edge.unmount('foo')
    assert.deepEqual(edge.loader.mounted, {})
  })

  test('register globals', (assert) => {
    const edge = new Edge()
    edge.global('foo', 'bar')
    assert.deepEqual(edge['globals'].foo, 'bar')
  })

  test('add a custom tag to the tags list', (assert) => {
    const edge = new Edge()

    class MyTag {
      public static tagName = 'mytag'
      public static block = true
      public static seekable = true
      public static compile (): void {
      }
    }

    edge.registerTag(MyTag)
    assert.deepEqual(edge.compiler['tags'].mytag, MyTag)
  })

  test('invoke tag run method when registering the tag', (assert) => {
    assert.plan(2)

    const edge = new Edge()

    class MyTag {
      public static tagName = 'mytag'
      public static block = true
      public static seekable = true
      public static compile (): void {
      }

      public static run (): void {
        assert.isTrue(true)
      }
    }

    edge.registerTag(MyTag)
    assert.deepEqual(edge.compiler['tags'].mytag, MyTag)
  })

  test('render a view using the render method', async (assert) => {
    const edge = new Edge()
    await fs.add('foo.edge', 'Hello {{ username }}')

    edge.mount(fs.basePath)
    assert.equal(edge.render('foo', { username: 'virk' }).trim(), 'Hello virk')
  })

  test('pass locals to the view context', async (assert) => {
    const edge = new Edge()
    await fs.add('foo.edge', 'Hello {{ username || \'guest\' }}')

    edge.mount(fs.basePath)

    const tmpl = edge.getRenderer()
    tmpl.share({ username: 'nikk' })

    assert.equal(tmpl.render('foo', {}).trim(), 'Hello nikk')
    assert.equal(edge.render('foo', {}).trim(), 'Hello guest')
  })

  test('register a template as a string', async (assert) => {
    const edge = new Edge()

    edge.registerTemplate('foo', {
      template: 'Hello {{ username }}',
    })

    assert.equal(edge.render('foo', { username: 'virk' }).trim(), 'Hello virk')
  })

  test('register a template on a named disk', async (assert) => {
    const edge = new Edge()
    edge.mount('hello', fs.basePath)

    edge.registerTemplate('hello::foo', {
      template: 'Hello {{ username }}',
    })

    assert.equal(edge.render('hello::foo', { username: 'virk' }).trim(), 'Hello virk')
  })

  test('pass absolute path of template to lexer errors', async (assert) => {
    assert.plan(1)
    await fs.add('foo.edge', '@if(1 + 1)')

    const edge = new Edge()
    edge.mount(fs.basePath)

    try {
      edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(stack.split('\n')[1].trim(), `at anonymous (${join(fs.basePath, 'foo.edge')}:1:4)`)
    }
  })

  test('pass absolute path of template to parser errors', async (assert) => {
    assert.plan(1)
    await fs.add('foo.edge', 'Hello {{ a,:b }}')

    const edge = new Edge()
    edge.mount(fs.basePath)

    try {
      edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(stack.split('\n')[1].trim(), `at anonymous (${join(fs.basePath, 'foo.edge')}:1:11)`)
    }
  })

  test('pass absolute path of layout to lexer errors', async (assert) => {
    assert.plan(1)
    await fs.add('foo.edge', '@layout(\'bar\')')
    await fs.add('bar.edge', '@if(username)')

    const edge = new Edge()
    edge.mount(fs.basePath)

    try {
      edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(stack.split('\n')[1].trim(), `at anonymous (${join(fs.basePath, 'bar.edge')}:1:4)`)
    }
  })

  test('pass absolute path of layout to parser errors', async (assert) => {
    assert.plan(1)
    await fs.add('foo.edge', '@layout(\'bar\')')
    await fs.add('bar.edge', '{{ a:b }}')

    const edge = new Edge()
    edge.mount(fs.basePath)

    try {
      edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(stack.split('\n')[1].trim(), `at anonymous (${join(fs.basePath, 'bar.edge')}:1:3)`)
    }
  })

  test('pass absolute path of partial to lexer errors', async (assert) => {
    assert.plan(1)
    await fs.add('foo.edge', '@include(\'bar\')')
    await fs.add('bar.edge', '@if(username)')

    const edge = new Edge()
    edge.mount(fs.basePath)

    try {
      edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(stack.split('\n')[1].trim(), `at anonymous (${join(fs.basePath, 'bar.edge')}:1:4)`)
    }
  })

  test('pass absolute path of partial to parser errors', async (assert) => {
    assert.plan(1)
    await fs.add('foo.edge', '@include(\'bar\')')
    await fs.add('bar.edge', '{{ a:b }}')

    const edge = new Edge()
    edge.mount(fs.basePath)

    try {
      edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(stack.split('\n')[1].trim(), `at anonymous (${join(fs.basePath, 'bar.edge')}:1:3)`)
    }
  })

  test('pass absolute path of component to lexer errors', async (assert) => {
    assert.plan(1)
    await fs.add('foo.edge', '@!component(\'bar\')')
    await fs.add('bar.edge', '@if(username)')

    const edge = new Edge()
    edge.mount(fs.basePath)

    try {
      edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(stack.split('\n')[1].trim(), `at anonymous (${join(fs.basePath, 'bar.edge')}:1:4)`)
    }
  })

  test('pass absolute path of component to parser errors', async (assert) => {
    assert.plan(1)
    await fs.add('foo.edge', '@!component(\'bar\')')
    await fs.add('bar.edge', '{{ a:b }}')

    const edge = new Edge()
    edge.mount(fs.basePath)

    try {
      edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(stack.split('\n')[1].trim(), `at anonymous (${join(fs.basePath, 'bar.edge')}:1:3)`)
    }
  })
})

test.group('Edge | globals', () => {
  test('return first item from an array', (assert) => {
    const edge = new Edge()
    edge.registerTemplate('welcome', {
      template: 'Hello {{ first(users) }}',
    })
    applyGlobals(edge)
    assert.equal(edge.render('welcome', { users: ['virk', 'romain'] }), 'Hello virk')
  })

  test('return last item from an array', (assert) => {
    const edge = new Edge()
    edge.registerTemplate('welcome', {
      template: 'Hello {{ last(users) }}',
    })
    applyGlobals(edge)
    assert.equal(edge.render('welcome', { users: ['virk', 'romain'] }), 'Hello romain')
  })

  test('group array values by key', (assert) => {
    const edge = new Edge()
    edge.registerTemplate('welcome', {
      template: 'Total of {{ groupBy(users, \'age\')[\'28\'].length }} users',
    })
    applyGlobals(edge)

    const users = [
      {
        username: 'virk',
        age: 28,
      },
      {
        username: 'romain',
        age: 28,
      },
      {
        username: 'nikk',
        age: 26,
      },
    ]

    assert.equal(edge.render('welcome', { users }), 'Total of 2 users')
  })

  test('group array values by closure', (assert) => {
    const edge = new Edge()
    edge.registerTemplate('welcome', {
      template: `Total of {{
        groupBy(users, ({ age }) => age)[\'28\'].length
      }} users`,
    })
    applyGlobals(edge)

    const users = [
      {
        username: 'virk',
        age: 28,
      },
      {
        username: 'romain',
        age: 28,
      },
      {
        username: 'nikk',
        age: 26,
      },
    ]

    assert.equal(edge.render('welcome', { users }), 'Total of 2 users')
  })
})
