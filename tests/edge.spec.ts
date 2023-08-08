/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import './assert_extend.js'
import dedent from 'dedent-js'
import { EOL } from 'node:os'
import { join } from 'node:path'
import { test } from '@japa/runner'

import { Edge } from '../src/edge/index.js'
import { GLOBALS } from '../src/edge/globals/index.js'

test.group('Edge', () => {
  test('mount default disk', async ({ assert, fs }) => {
    const edge = new Edge()
    edge.mount(fs.basePath)
    assert.deepEqual(edge.loader.mounted, { default: fs.basePath })
  })

  test('mount named disk', async ({ assert, fs }) => {
    const edge = new Edge()
    edge.mount('foo', fs.basePath)
    assert.deepEqual(edge.loader.mounted, { foo: fs.basePath })
  })

  test('unmount named disk', async ({ assert, fs }) => {
    const edge = new Edge()
    edge.mount('foo', fs.basePath)
    edge.unmount('foo')
    assert.deepEqual(edge.loader.mounted, {})
  })

  test('register globals', async ({ assert }) => {
    const edge = new Edge()
    edge.global('foo', 'bar')
    assert.deepEqual(edge.GLOBALS.foo, 'bar')
  })

  test('add a custom tag to the tags list', async ({ assert }) => {
    const edge = new Edge()

    class MyTag {
      static tagName = 'mytag'
      static block = true
      static seekable = true
      static compile(): void {}
    }

    edge.registerTag(MyTag)
    assert.deepEqual(edge['tags'].mytag, MyTag)
  })

  test('invoke tag boot method when registering the tag', async ({ assert }) => {
    assert.plan(2)

    const edge = new Edge()

    class MyTag {
      static tagName = 'mytag'
      static block = true
      static seekable = true
      static compile(): void {}

      static boot(): void {
        assert.isTrue(true)
      }
    }

    edge.registerTag(MyTag)
    assert.deepEqual(edge['tags'].mytag, MyTag)
  })

  test('render a view using the render method', async ({ assert, fs }) => {
    const edge = new Edge()
    await fs.create('foo.edge', 'Hello {{ username }}')

    edge.mount(fs.basePath)
    const output = await edge.render('foo', { username: 'virk' })
    assert.equal(output.trim(), 'Hello virk')
  })

  test('pass locals to the view context', async ({ assert, fs }) => {
    const edge = new Edge()
    await fs.create('foo.edge', "Hello {{ username || 'guest' }}")

    edge.mount(fs.basePath)

    const tmpl = edge.getRenderer()
    tmpl.share({ username: 'nikk' })

    const output = await tmpl.render('foo', {})
    const output1 = await edge.render('foo', {})

    assert.equal(output.trim(), 'Hello nikk')
    assert.equal(output1.trim(), 'Hello guest')
  })

  test('register a template as a string', async ({ assert }) => {
    const edge = new Edge()

    edge.registerTemplate('foo', {
      template: 'Hello {{ username }}',
    })

    const output = await edge.render('foo', { username: 'virk' })
    assert.equal(output.trim(), 'Hello virk')
  })

  test('register a template on a named disk', async ({ assert, fs }) => {
    const edge = new Edge()
    edge.mount('hello', fs.basePath)

    edge.registerTemplate('hello::foo', {
      template: 'Hello {{ username }}',
    })

    const output = await edge.render('hello::foo', { username: 'virk' })
    assert.equal(output.trim(), 'Hello virk')
  })

  test('clear compiled cache when in-memory template is removed', async ({ assert }) => {
    const edge = new Edge({ cache: true })

    edge.registerTemplate('foo', {
      template: 'Hello {{ username }}',
    })

    const output = await edge.render('foo', { username: 'virk' })
    assert.equal(output.trim(), 'Hello virk')
    assert.equal(edge.renderSync('foo', { username: 'virk' }).trim(), 'Hello virk')

    edge.removeTemplate('foo')
    edge.registerTemplate('foo', {
      template: 'Hi {{ username }}',
    })

    const output1 = await edge.render('foo', { username: 'virk' })
    assert.equal(output1.trim(), 'Hi virk')
    assert.equal(edge.renderSync('foo', { username: 'virk' }).trim(), 'Hi virk')
  })

  test('pass absolute path of template to lexer errors', async ({ assert, fs }) => {
    assert.plan(1)
    await fs.create('foo.edge', '@if(1 + 1)')

    const edge = new Edge()
    edge.mount(fs.basePath)

    try {
      await edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(
        stack.split('\n')[1].trim(),
        `at anonymous (${join(fs.basePath, 'foo.edge')}:1:4)`
      )
    }
  })

  test('pass absolute path of template to parser errors', async ({ assert, fs }) => {
    assert.plan(1)
    await fs.create('foo.edge', 'Hello {{ a,:b }}')

    const edge = new Edge()
    edge.mount(fs.basePath)

    try {
      await edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(
        stack.split('\n')[1].trim(),
        `at anonymous (${join(fs.basePath, 'foo.edge')}:1:11)`
      )
    }
  })

  test('pass absolute path of layout to lexer errors', async ({ assert, fs }) => {
    assert.plan(1)
    await fs.create('foo.edge', "@layout('bar')")
    await fs.create('bar.edge', '@if(username)')

    const edge = new Edge()
    edge.mount(fs.basePath)

    try {
      await edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(
        stack.split('\n')[1].trim(),
        `at anonymous (${join(fs.basePath, 'bar.edge')}:1:4)`
      )
    }
  })

  test('pass absolute path of layout to parser errors', async ({ assert, fs }) => {
    assert.plan(1)
    await fs.create('foo.edge', "@layout('bar')")
    await fs.create('bar.edge', '{{ a:b }}')

    const edge = new Edge()
    edge.mount(fs.basePath)

    try {
      await edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(
        stack.split('\n')[1].trim(),
        `at anonymous (${join(fs.basePath, 'bar.edge')}:1:3)`
      )
    }
  })

  test('pass absolute path of partial to lexer errors', async ({ assert, fs }) => {
    assert.plan(1)
    await fs.create('foo.edge', "@include('bar')")
    await fs.create('bar.edge', '@if(username)')

    const edge = new Edge()
    edge.mount(fs.basePath)

    try {
      await edge.render('foo', false)
    } catch ({ stack }) {
      console.log(stack)
      assert.equal(
        stack.split('\n')[1].trim(),
        `at anonymous (${join(fs.basePath, 'bar.edge')}:1:4)`
      )
    }
  })

  test('pass absolute path of partial to parser errors', async ({ assert, fs }) => {
    assert.plan(1)
    await fs.create('foo.edge', "@include('bar')")
    await fs.create('bar.edge', '{{ a:b }}')

    const edge = new Edge()
    edge.mount(fs.basePath)

    try {
      await edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(
        stack.split('\n')[1].trim(),
        `at anonymous (${join(fs.basePath, 'bar.edge')}:1:3)`
      )
    }
  })

  test('pass absolute path of component to lexer errors', async ({ assert, fs }) => {
    assert.plan(1)
    await fs.create('foo.edge', "@!component('bar')")
    await fs.create('bar.edge', '@if(username)')

    const edge = new Edge()
    edge.mount(fs.basePath)

    try {
      await edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(
        stack.split('\n')[1].trim(),
        `at anonymous (${join(fs.basePath, 'bar.edge')}:1:4)`
      )
    }
  })

  test('pass absolute path of component to parser errors', async ({ assert, fs }) => {
    assert.plan(1)
    await fs.create('foo.edge', "@!component('bar')")
    await fs.create('bar.edge', '{{ a:b }}')

    const edge = new Edge()
    edge.mount(fs.basePath)

    try {
      await edge.render('foo', false)
    } catch ({ stack }) {
      assert.equal(
        stack.split('\n')[1].trim(),
        `at anonymous (${join(fs.basePath, 'bar.edge')}:1:3)`
      )
    }
  })

  test('register and call plugins before rendering a view', async ({ assert, fs }) => {
    assert.plan(3)
    const edge = new Edge()

    edge.use(($edge) => {
      assert.deepEqual($edge.loader.mounted, { hello: fs.basePath })
      assert.deepEqual(edge.loader.templates, {
        'hello::foo': { template: 'Hello {{ username }}' },
      })
    })

    edge.mount('hello', fs.basePath)
    edge.registerTemplate('hello::foo', {
      template: 'Hello {{ username }}',
    })

    const output = await edge.render('hello::foo', { username: 'virk' })
    assert.equal(output.trim(), 'Hello virk')
  })

  test('do not run plugins until a view is rendered', async ({ assert, fs }) => {
    assert.plan(0)
    const edge = new Edge()

    edge.use(($edge) => {
      assert.deepEqual($edge.loader.mounted, { hello: fs.basePath })
      assert.deepEqual(edge.loader.templates, {
        'hello::foo': { template: 'Hello {{ username }}' },
      })
    })

    edge.mount('hello', fs.basePath)
    edge.registerTemplate('hello::foo', {
      template: 'Hello {{ username }}',
    })
  })

  test('run plugins only once', async ({ assert, fs }) => {
    assert.plan(2)
    const edge = new Edge()

    edge.use(($edge) => {
      assert.deepEqual($edge.loader.mounted, { hello: fs.basePath })
      assert.deepEqual(edge.loader.templates, {
        'hello::foo': { template: 'Hello {{ username }}' },
      })
    })

    edge.mount('hello', fs.basePath)
    edge.registerTemplate('hello::foo', {
      template: 'Hello {{ username }}',
    })

    await edge.render('hello::foo', { username: 'virk' })
    await edge.render('hello::foo', { username: 'virk' })
    await edge.render('hello::foo', { username: 'virk' })
  })

  test('run recurring plugins again and again', async ({ assert, fs }) => {
    assert.plan(6)
    const edge = new Edge()

    edge.use(
      ($edge) => {
        assert.deepEqual($edge.loader.mounted, { hello: fs.basePath })
        assert.deepEqual(edge.loader.templates, {
          'hello::foo': { template: 'Hello {{ username }}' },
        })
      },
      { recurring: true }
    )

    edge.mount('hello', fs.basePath)
    edge.registerTemplate('hello::foo', {
      template: 'Hello {{ username }}',
    })

    await edge.render('hello::foo', { username: 'virk' })
    await edge.render('hello::foo', { username: 'virk' })
    await edge.render('hello::foo', { username: 'virk' })
  })

  test('hook into renderer instance', async ({ assert, fs }) => {
    const edge = new Edge()

    edge.onRender((renderer) => {
      renderer.share({ foo: 'bar' })
    })

    edge.mount('hello', fs.basePath)
    edge.registerTemplate('hello::foo', {
      template: 'Hello {{ foo }}',
    })

    const output = await edge.render('hello::foo')
    assert.equal(output.trim(), 'Hello bar')
  })
})

test.group('Edge | regression', () => {
  test('render non-existy values', async ({ assert }) => {
    const edge = new Edge()
    edge.registerTemplate('numeric', {
      template: 'Total {{ total }}',
    })

    edge.registerTemplate('boolean', {
      template: 'Is Active {{ isActive }}',
    })

    assert.equal(await edge.render('numeric', { total: 0 }), 'Total 0')
    assert.equal(await edge.render('boolean', { isActive: false }), 'Is Active false')
  })

  test('render inline scripts with regex', async ({ assert }) => {
    const edge = new Edge()
    edge.registerTemplate('eval', {
      template: dedent`
      <script type="text/javascript">
        var pl = /\+/g
      </script>
      `,
    })

    assert.stringEqual(
      await edge.render('eval'),
      dedent`
      <script type="text/javascript">
        var pl = /\+/g
      </script>
    `
    )
  })

  test('render complex binary expressions', async ({ assert }) => {
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

    assert.equal(
      await edge.render('eval', {
        line: { id: 1, lineName: 'aaa', user: {} },
        user: { line: {} },
      }),
      dedent`
      aaa (unselected)
    `
    )
  })

  test('do not escape when using safe global method', async ({ assert }) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    edge.registerTemplate('eval', {
      template: 'Hello {{ safe(username) }}',
    })
    assert.equal(await edge.render('eval', { username: '<p>virk</p>' }), 'Hello <p>virk</p>')
  })

  test('truncate string by characters', async ({ assert }) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    edge.registerTemplate('eval', {
      template: '{{{ truncate(text, 10) }}}',
    })
    assert.equal(
      await edge.render('eval', { text: '<p>hello world & universe</p>' }),
      '<p>hello world...</p>'
    )
  })

  test('truncate string by characters in strict mode', async ({ assert }) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    edge.registerTemplate('eval', {
      template: '{{{ truncate(text, 10, { strict: true }) }}}',
    })
    assert.equal(
      await edge.render('eval', { text: '<p>hello world & universe</p>' }),
      '<p>hello worl...</p>'
    )
  })

  test('define custom suffix for truncate', async ({ assert }) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    edge.registerTemplate('eval', {
      template: '{{{ truncate(text, 10, { suffix: ". more" }) }}}',
    })
    assert.equal(
      await edge.render('eval', { text: '<p>hello world & universe</p>' }),
      '<p>hello world. more</p>'
    )
  })

  test('generate string excerpt', async ({ assert }) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    edge.registerTemplate('eval', {
      template: '{{{ excerpt(text, 10) }}}',
    })
    assert.equal(
      await edge.render('eval', { text: '<p>hello world & universe</p>' }),
      'hello world...'
    )
  })

  test('excerpt remove in-between tag', async ({ assert }) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    edge.registerTemplate('eval', {
      template: '{{{ excerpt(text, 10) }}}',
    })
    assert.equal(
      await edge.render('eval', {
        text: '<p>hello <strong>world</strong> & <strong>universe</strong></p>',
      }),
      'hello world...'
    )
  })

  test('generate excerpt in strict mode', async ({ assert }) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    edge.registerTemplate('eval', {
      template: '{{{ excerpt(text, 10, { strict: true }) }}}',
    })
    assert.equal(
      await edge.render('eval', {
        text: '<p>hello <strong>world</strong> & <strong>universe</strong></p>',
      }),
      'hello worl...'
    )
  })

  test('add custom suffix for excerpt', async ({ assert }) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    edge.registerTemplate('eval', {
      template: '{{{ excerpt(text, 10, { suffix: ". more" }) }}}',
    })
    assert.equal(
      await edge.render('eval', {
        text: '<p>hello <strong>world</strong> & <strong>universe</strong></p>',
      }),
      'hello world. more'
    )
  })

  test('convert newline to br tags', async ({ assert }) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    /**
     * Intentionally using `EOL`, so that we can test that in windows
     * the newlines are also converted to br tags
     */
    edge.registerTemplate('eval', {
      template: '{{{ nl2br(text) }}}',
    })

    assert.equal(await edge.render('eval', { text: `Hello${EOL}world` }), 'Hello<br>world')
  })

  test('escape user input except the new lines', async ({ assert }) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    /**
     * Intentionally using `EOL`, so that we can test that in windows
     * the newlines are also converted to br tags
     */
    edge.registerTemplate('eval', {
      template: '{{{ nl2br(e(text)) }}}',
    })

    assert.equal(
      await edge.render('eval', { text: `Hello${EOL}<strong>world</strong>` }),
      'Hello<br>&lt;strong&gt;world&lt;/strong&gt;'
    )
  })

  test('stringify data structures', async ({ assert }) => {
    const edge = new Edge()
    Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))

    /**
     * Intentionally using `EOL`, so that we can test that in windows
     * the newlines are also converted to br tags
     */
    edge.registerTemplate('eval', {
      template: `{{ stringify({ user: { username: 'virk' } }) }}`,
    })

    assert.equal(
      await edge.render('eval'),
      '{&quot;user&quot;:{&quot;username&quot;:&quot;virk&quot;}}'
    )
  })
})
