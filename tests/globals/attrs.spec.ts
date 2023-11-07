/*
 * edge-js
 *
 * (c) Edge
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import '../assert_extend.js'
import dedent from 'dedent-js'
import { test } from '@japa/runner'
import path, { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Filesystem } from '@poppinss/dev-utils'

import { Loader } from '../../src/loader.js'
import { Template } from '../../src/template.js'
import { Compiler } from '../../src/compiler.js'
import { slotTag } from '../../src/tags/slot.js'
import { Processor } from '../../src/processor.js'
import { includeTag } from '../../src/tags/include.js'
import { edgeGlobals } from '../../src/edge/globals.js'
import { componentTag } from '../../src/tags/component.js'

const tags = { slot: slotTag, component: componentTag, include: includeTag }
const fs = new Filesystem(join(path.dirname(fileURLToPath(import.meta.url)), 'views'))

const loader = new Loader()
loader.mount('default', fs.basePath)

test.group('Template | toAttributes', () => {
  test('serialize object to HTML attributes', async ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, edgeGlobals, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <button {{
        html.attrs({
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

    assert.stringEqual(
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
    const template = new Template(compiler, edgeGlobals, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <button {{
        html.attrs({
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

    assert.stringEqual(
      html,
      dedent`
    <button disabled type="text" aria-label="Buy products">
      Click here
    </button>
    `
    )
  })

  test('handle overloaded boolean properties', async ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, edgeGlobals, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <button {{
        html.attrs({
          download: true
        })
      }}>
        Click here
      </button>
    `,
      {}
    )

    assert.stringEqual(
      html,
      dedent`
    <button download>
      Click here
    </button>
    `
    )
  })

  test('handle overloaded boolean properties with explicit value', async ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, edgeGlobals, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <button {{
        html.attrs({
          download: 'sample.pdf'
        })
      }}>
        Click here
      </button>
    `,
      {}
    )

    assert.stringEqual(
      html,
      dedent`
    <button download="sample.pdf">
      Click here
    </button>
    `
    )
  })

  test('allow non-standard attributes', async ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, edgeGlobals, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <button {{
        html.attrs({
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

    assert.stringEqual(
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
    const template = new Template(compiler, edgeGlobals, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <input {{
        html.attrs({
          accept: ["audio/*", "video/*", "image/*"]
        })
      }} />
    `,
      {}
    )

    assert.stringEqual(
      html,
      dedent`
      <input accept="audio/*,video/*,image/*" />
    `
    )
  })

  test('define alpine js attributes', async ({ assert }) => {
    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, edgeGlobals, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <div {{
        html.attrs({
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

    assert.stringEqual(
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
    const template = new Template(compiler, edgeGlobals, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <div {{
        html.attrs({
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

    assert.stringEqual(
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
    const template = new Template(compiler, edgeGlobals, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <div {{
        html.attrs({
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

    assert.stringEqual(
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
    const template = new Template(compiler, edgeGlobals, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <div {{
        html.attrs({
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

    assert.stringEqual(
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
    const template = new Template(compiler, edgeGlobals, {}, processor)

    const html = await template.renderRaw(
      dedent`
      <div {{
        html.attrs({
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

    assert.stringEqual(
      html,
      dedent`
      <div x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 scale-90" x-transition:enter-end="opacity-100 scale-100" x-transition:leave="transition ease-in duration-300" x-transition:leave-start="opacity-100 scale-100" x-transition:leave-end="opacity-0 scale-90">
      </div>
    `
    )
  })
})
