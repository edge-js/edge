/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import './assert-extend'
import test from 'japa'
import { join } from 'path'
import dedent from 'dedent-js'
import { Filesystem } from '@poppinss/dev-utils'

import { Edge } from '../src/Edge'
import { GLOBALS } from '../src/Edge/globals'

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
    assert.deepEqual(edge.GLOBALS.foo, 'bar')
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

test.group('Edge | regression', () => {
  test('render non-existy values', (assert) => {
    const edge = new Edge()
    edge.registerTemplate('numeric', {
      template: 'Total {{ total }}',
    })

    edge.registerTemplate('boolean', {
      template: 'Is Active {{ isActive }}',
    })

    assert.equal(edge.render('numeric', { total: 0 }), 'Total 0')
    assert.equal(edge.render('boolean', { isActive: false }), 'Is Active false')
  })

  test('render inline scripts with regex', (assert) => {
    const edge = new Edge()
    edge.registerTemplate('eval', {
      template: dedent`
      <script type="text/javascript">
        var pl = /\+/g
      </script>
      `,
    })

    assert.stringEqual(edge.render('eval'), dedent`
      <script type="text/javascript">
        var pl = /\+/g
      </script>
    `)
  })

  test('render complex binary expressions', (assert) => {
    const edge = new Edge()
    edge.registerTemplate('eval', {
      template: dedent`
      {{
        line.lineName + (
          (user.line.id === line.id)
            ? ' (current)' :
            (' (' + (line.user.username || 'unselected') + ')')
          )
      }}`,
    })

    assert.equal(edge.render('eval', {
      line: { id: 1, lineName: 'aaa', user: {} },
      user: { line: {} },
    }), dedent`
      aaa (unselected)
    `)
  })

  test('do not escape when using safe global method', (assert) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    edge.registerTemplate('eval', {
      template: 'Hello {{ safe(username) }}',
    })
    assert.equal(edge.render('eval', { username: '<p>virk</p>' }), 'Hello <p>virk</p>')
  })

  test('truncate string by characters', (assert) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    edge.registerTemplate('eval', {
      template: '{{{ truncate(text, 10) }}}',
    })
    assert.equal(edge.render('eval', { text: '<p>hello world & universe</p>' }), '<p>hello world...</p>')
  })

  test('truncate string by characters in strict mode', (assert) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    edge.registerTemplate('eval', {
      template: '{{{ truncate(text, 10, { strict: true }) }}}',
    })
    assert.equal(edge.render('eval', { text: '<p>hello world & universe</p>' }), '<p>hello worl...</p>')
  })

  test('define custom suffix for truncate', (assert) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    edge.registerTemplate('eval', {
      template: '{{{ truncate(text, 10, { suffix: ". more" }) }}}',
    })
    assert.equal(edge.render('eval', { text: '<p>hello world & universe</p>' }), '<p>hello world. more</p>')
  })

  test('generate string excerpt', (assert) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    edge.registerTemplate('eval', {
      template: '{{{ excerpt(text, 10) }}}',
    })
    assert.equal(edge.render('eval', { text: '<p>hello world & universe</p>' }), 'hello world...')
  })

  test('excerpt remove in-between tag', (assert) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    edge.registerTemplate('eval', {
      template: '{{{ excerpt(text, 10) }}}',
    })
    assert.equal(edge.render('eval', {
      text: '<p>hello <strong>world</strong> & <strong>universe</strong></p>',
    }), 'hello world...')
  })

  test('generate excerpt in strict mode', (assert) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    edge.registerTemplate('eval', {
      template: '{{{ excerpt(text, 10, { strict: true }) }}}',
    })
    assert.equal(edge.render('eval', {
      text: '<p>hello <strong>world</strong> & <strong>universe</strong></p>',
    }), 'hello worl...')
  })

  test('add custom suffix for excerpt', (assert) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    edge.registerTemplate('eval', {
      template: '{{{ excerpt(text, 10, { suffix: ". more" }) }}}',
    })
    assert.equal(edge.render('eval', {
      text: '<p>hello <strong>world</strong> & <strong>universe</strong></p>',
    }), 'hello world. more')
  })
})
