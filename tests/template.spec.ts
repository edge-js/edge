/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import './assert_extend.js'
import dedent from 'dedent-js'
import { test } from '@japa/runner'
import path, { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Filesystem } from '@poppinss/dev-utils'

import { Loader } from '../src/loader.js'
import { Compiler } from '../src/compiler.js'
import { slotTag } from '../src/tags/slot.js'
import { Processor } from '../src/processor.js'
import { includeTag } from '../src/tags/include.js'
import { componentTag } from '../src/tags/component.js'
import { Template, htmlSafe } from '../src/template.js'

const tags = { slot: slotTag, component: componentTag, include: includeTag }
const fs = new Filesystem(join(path.dirname(fileURLToPath(import.meta.url)), 'views'))

const loader = new Loader()
loader.mount('default', fs.basePath)

test.group('Template', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('render template using the given state', async ({ assert }) => {
    await fs.add('foo.edge', 'Hello {{ username }}')

    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)

    const output = template.render<string>('foo', {
      username: 'virk',
    })

    assert.equal(output.trim(), 'Hello virk')
  })

  test('run template with shared state', async ({ assert }) => {
    await fs.add('foo.edge', 'Hello {{ getUsername() }}')
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(
      compiler,
      { username: 'virk' },
      {
        getUsername() {
          return this.username.toUpperCase()
        },
      },
      processor
    )

    const output = template.render<string>('foo', {})
    assert.equal(output.trim(), 'Hello VIRK')
  })

  test('compile and render a partial', async ({ assert }) => {
    await fs.add('foo.edge', 'Hello {{ username }}')

    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)
    const partial = template.compilePartial('foo')

    const output = partial(template, { username: 'virk' }, {})
    assert.equal(output.trim(), 'Hello virk')
  })

  test('pass local variables to inline templates', async ({ assert }) => {
    await fs.add('foo.edge', 'Hello {{ user.username }}')

    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)
    const partial = template.compilePartial('foo', 'user')

    const user = { username: 'virk' }
    const output = partial(template, {}, {}, user)
    assert.equal(output.trim(), 'Hello virk')
  })

  test('process file names starting with u', async ({ assert }) => {
    await fs.add('users.edge', 'Hello {{ user.username }}')

    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)

    const user = { username: 'virk' }
    const output = template.render('users', { user }) as string
    assert.equal(output.trim(), 'Hello virk')
  })

  test('execute output processor function', async ({ assert }) => {
    assert.plan(3)
    await fs.add('users.edge', 'Hello {{ user.username }}')

    const processor = new Processor()
    processor.process('output', ({ output, template }) => {
      assert.stringEqual(output, 'Hello virk')
      assert.instanceOf(template, Template)
    })

    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)

    const user = { username: 'virk' }
    const output = template.render('users', { user }) as string
    assert.equal(output.trim(), 'Hello virk')
  })

  test('get access to state inside compiled output', async ({ assert }) => {
    assert.plan(2)
    await fs.add('users.edge', 'Hello {{ user.username }}')

    const processor = new Processor()
    processor.process('output', ({ state }) => {
      assert.deepEqual(state, {
        user: { username: 'virk' },
        global: true,
        local: true,
      })
    })

    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(
      compiler,
      {
        global: true,
      },
      {
        local: true,
      },
      processor
    )

    const user = { username: 'virk' }
    const output = template.render('users', { user }) as string
    assert.equal(output.trim(), 'Hello virk')
  })

  test('use return value of the output processor function', async ({ assert }) => {
    assert.plan(3)
    await fs.add('users.edge', 'Hello {{ user.username }}')

    const processor = new Processor()
    processor.process('output', ({ output, template }) => {
      assert.stringEqual(output, 'Hello virk')
      assert.instanceOf(template, Template)
      return output.toUpperCase()
    })

    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)

    const user = { username: 'virk' }
    const output = template.render('users', { user }) as string
    assert.equal(output.trim(), 'HELLO VIRK')
  })

  test('escape HTML', ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)
    assert.equal(template.escape('<h2> Hello world </h2>'), '&lt;h2&gt; Hello world &lt;/h2&gt;')
  })

  test('stringify value during escape', ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)
    assert.equal(template.escape(22), '22')
  })

  test('do not escape values, which instance of safe value', ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)
    assert.equal(template.escape(htmlSafe('<h2> Hello world </h2>')), '<h2> Hello world </h2>')
  })

  test('stringify array before escape', ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)
    assert.equal(template.escape(['<h2> Hello world </h2>']), '&lt;h2&gt; Hello world &lt;/h2&gt;')
  })

  test('stringify object before escape', ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)
    assert.equal(
      template.escape({
        toString() {
          return '<h2> Hello world </h2>'
        },
      }),
      '&lt;h2&gt; Hello world &lt;/h2&gt;'
    )
  })

  test('add macros to context', ({ assert }) => {
    Template.macro('upper' as any, (username: string) => {
      return username.toUpperCase()
    })

    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)
    // @ts-expect-error
    assert.equal(template['upper']('virk'), 'VIRK')
  })

  test('add getters to context', ({ assert }) => {
    Template.getter('username' as any, function username() {
      return 'virk'
    })

    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)
    // @ts-expect-error
    assert.equal(template['username'], 'virk')
  })

  test('share local variables with partials when caching is enabled', async ({ assert }) => {
    await fs.add('foo.edge', 'Hello {{ username }}')

    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: true })
    const template = new Template(compiler, {}, {}, processor)

    const partail = template.compilePartial('foo')
    assert.equal(partail(template, {}, {}).trim(), 'Hello undefined')

    const partailWithInlineVariables = template.compilePartial('foo', 'username')
    assert.equal(partailWithInlineVariables(template, {}, {}, 'virk').trim(), 'Hello virk')
  })
})

test.group('Template | toAttributes', () => {
  test('serialize object to HTML attributes', async ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <button {{
        ({
          disabled: false,
          type: 'text',
          ariaLabel: 'Buy products'
        })
      }}>
        Click here
      </button>
    `,
      {
        hasError: false,
      }
    )

    assert.equal(
      html,
      dedent`
    <button type="text" aria-label="Buy products">
      Click here
    </button>
    `
    )
  })

  test('allow properties with no values', async ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <button {{
        ({
          disabled: true,
          type: 'text',
          ariaLabel: 'Buy products'
        })
      }}>
        Click here
      </button>
    `,
      {}
    )

    assert.equal(
      html,
      dedent`
    <button disabled type="text" aria-label="Buy products">
      Click here
    </button>
    `
    )
  })

  test('allow non-standard attributes', async ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <button {{
        ({
          foo: 'bar'
        })
      }}>
        Click here
      </button>
    `,
      {
        hasError: false,
      }
    )

    assert.equal(
      html,
      dedent`
    <button foo="bar">
      Click here
    </button>
    `
    )
  })

  test('define comma separated values', async ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <input {{
        ({
          accept: ["audio/*", "video/*", "image/*"]
        })
      }} />
    `,
      {}
    )

    assert.equal(
      html,
      dedent`
      <input accept="audio/*,video/*,image/*" />
    `
    )
  })

  test('define alpine js attributes', async ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <div {{
        ({
          x: {
            data: '{ open: false }',
            init: "console.log('Here I am')",
            show: 'open',
          }
        })
      }}>
      </div>
    `,
      {}
    )

    assert.equal(
      html,
      dedent`
      <div x-data="{ open: false }" x-init="console.log('Here I am')" x-show="open">
      </div>
    `
    )
  })

  test('define alpine js boolean attributes', async ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <div {{
        ({
          x: {
            cloak: true,
            ignore: false
          }
        })
      }}>
      </div>
    `,
      {}
    )

    assert.equal(
      html,
      dedent`
      <div x-cloak>
      </div>
    `
    )
  })

  test('define alpine js event listeners', async ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <div {{
        ({
          xOn: {
            click: "alert($event.target.getAttribute('message'))",
            'keyup.enter': "alert('Submitted!')",
            'keyup.page-down': "alert('Submitted!')"
          }
        })
      }}>
      </div>
    `,
      {}
    )

    assert.equal(
      html,
      dedent`
      <div x-on:click="alert($event.target.getAttribute('message'))" x-on:keyup.enter="alert('Submitted!')" x-on:keyup.page-down="alert('Submitted!')">
      </div>
    `
    )
  })

  test('define alpinejs x-bind properties', async ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <div {{
        ({
          xBind: {
            class: "{ 'hidden': !show }",
            style: "{ color: 'red', display: 'flex' }"
          }
        })
      }}>
      </div>
    `,
      {}
    )

    assert.equal(
      html,
      dedent`
      <div x-bind:class="{ 'hidden': !show }" x-bind:style="{ color: 'red', display: 'flex' }">
      </div>
    `
    )
  })

  test('define alpinejs transition properties', async ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <div {{
        ({
          xTransition: {
            enter: "transition ease-out duration-300",
            enterStart: "opacity-0 scale-90",
            enterEnd: "opacity-100 scale-100",
            leave: "transition ease-in duration-300",
            leaveStart: "opacity-100 scale-100",
            leaveEnd: "opacity-0 scale-90",
          }
        })
      }}>
      </div>
    `,
      {}
    )

    assert.equal(
      html,
      dedent`
      <div x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 scale-90" x-transition:enter-end="opacity-100 scale-100" x-transition:leave="transition ease-in duration-300" x-transition:leave-start="opacity-100 scale-100" x-transition:leave-end="opacity-0 scale-90">
      </div>
    `
    )
  })
})
