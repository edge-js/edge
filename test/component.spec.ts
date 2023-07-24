/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { dirname, join } from 'node:path'
import dedent from 'dedent-js'
import { EdgeError } from 'edge-error'
import { Filesystem } from '@poppinss/dev-utils'

import { Loader } from '../src/loader/index.js'
import { Compiler } from '../src/compiler/index.js'
import { Template } from '../src/template/index.js'
import { Processor } from '../src/processor/index.js'

import { ifTag } from '../src/tags/if.js'
import { slotTag } from '../src/tags/slot.js'
import { injectTag } from '../src/tags/inject.js'
import { includeTag } from '../src/tags/include.js'
import { componentTag } from '../src/tags/component.js'
import './assert_extend.js'
import { fileURLToPath } from 'node:url'

const fs = new Filesystem(join(dirname(fileURLToPath(import.meta.url)), 'views'))
const tags = {
  component: componentTag,
  slot: slotTag,
  inject: injectTag,
  if: ifTag,
  include: includeTag,
}

const loader = new Loader()
loader.mount('default', fs.basePath)

const processor = new Processor()
const compiler = new Compiler(loader, tags, processor, { cache: false })

test.group('Component | compile | errors', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('report component arguments error', async ({ assert }) => {
    assert.plan(4)

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @component([1, 2])
      @endcomponent
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    try {
      template.render('eval.edge', {})
    } catch (error) {
      assert.equal(error.message, '"[1, 2]" is not a valid argument type for the @component tag')
      assert.equal(error.line, 3)
      assert.equal(error.col, 11)
      assert.equal(error.filename, join(fs.basePath, 'eval.edge'))
    }
  })

  test('report slot argument name error', async ({ assert }) => {
    assert.plan(4)

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @component('foo')
        @slot(getSlotName())
        @endslot
      @endcomponent
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    try {
      template.render('eval.edge', {})
    } catch (error) {
      assert.equal(error.message, '"getSlotName()" is not a valid argument type for the @slot tag')
      assert.equal(error.line, 4)
      assert.equal(error.col, 8)
      assert.equal(error.filename, join(fs.basePath, 'eval.edge'))
    }
  })

  test('report slot arguments error', async ({ assert }) => {
    assert.plan(4)

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @component('foo')
        @slot('main', 'foo', 'bar')
        @endslot
      @endcomponent
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    try {
      template.render('eval.edge', {})
    } catch (error) {
      assert.equal(error.message, 'maximum of 2 arguments are allowed for @slot tag')
      assert.equal(error.line, 4)
      assert.equal(error.col, 8)
      assert.equal(error.filename, join(fs.basePath, 'eval.edge'))
    }
  })

  test('report slot scope argument error', async ({ assert }) => {
    assert.plan(4)

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @component('foo')
        @slot('main', [1, 2])
        @endslot
      @endcomponent
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    try {
      template.render('eval.edge', {})
    } catch (error) {
      assert.equal(error.message, '"[1, 2]" is not valid prop identifier for @slot tag')
      assert.equal(error.line, 4)
      assert.equal(error.col, 16)
      assert.equal(error.filename, join(fs.basePath, 'eval.edge'))
    }
  })
})

test.group('Component | render | errors', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('report component name runtime error', async ({ assert }) => {
    assert.plan(4)

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @component(getComponentName())
      @endcomponent
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    try {
      template.render('eval.edge', {})
    } catch (error) {
      assert.equal(error.message, 'getComponentName is not a function')
      assert.equal(error.line, 3)
      assert.equal(error.col, 0)
      assert.equal(error.filename, join(fs.basePath, 'eval.edge'))
    }
  })

  test('report component state argument error', async ({ assert }) => {
    assert.plan(4)

    await fs.add('button.edge', '')

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @component('button', { color: getColor() })
      @endcomponent
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    try {
      template.render('eval.edge', {})
    } catch (error) {
      assert.equal(error.message, 'getColor is not a function')
      assert.equal(error.line, 3)
      assert.equal(error.col, 0)
      assert.equal(error.filename, join(fs.basePath, 'eval.edge'))
    }
  })

  test('report component state argument error when spread over multiple lines', async ({
    assert,
  }) => {
    assert.plan(4)

    await fs.add('button.edge', '')

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @component('button', {
        color: getColor(),
      })
      @endcomponent
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    try {
      template.render('eval.edge', {})
    } catch (error) {
      assert.equal(error.message, 'getColor is not a function')
      /**
       * Expected to be on line 4. But okay for now
       */
      assert.equal(error.line, 3)
      assert.equal(error.col, 0)
      assert.equal(error.filename, join(fs.basePath, 'eval.edge'))
    }
  })

  test('report component state argument error with assignment expression', async ({ assert }) => {
    assert.plan(4)

    await fs.add('button.edge', '')

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @component('button', color = getColor())
      @endcomponent
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    try {
      template.render('eval.edge', {})
    } catch (error) {
      assert.equal(error.message, 'getColor is not a function')
      assert.equal(error.line, 3)
      assert.equal(error.col, 0)
      assert.equal(error.filename, join(fs.basePath, 'eval.edge'))
    }
  })

  test('report component state argument error with assignment expression in multiple lines', async ({
    assert,
  }) => {
    assert.plan(4)

    await fs.add('button.edge', '')

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @component(
        'button',
        color = getColor()
      )
      @endcomponent
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    try {
      template.render('eval.edge', {})
    } catch (error) {
      assert.equal(error.message, 'getColor is not a function')
      /**
       * Expected to be on line 5. But okay for now
       */
      assert.equal(error.line, 3)
      assert.equal(error.col, 0)
      assert.equal(error.filename, join(fs.basePath, 'eval.edge'))
    }
  })

  test('report scoped slot error', async ({ assert }) => {
    assert.plan(4)

    await fs.add('button.edge', '{{ $slots.text() }}')

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @component('button')
        @slot('text', button)
          {{ button.isPrimary() ? 'Hello primary' : 'Hello' }}
        @endslot
      @endcomponent
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    try {
      template.render('eval.edge', {})
    } catch (error) {
      assert.match(error.message, /^(?=.*\bCannot read\b)(?=.*\bisPrimary\b).*$/)
      assert.equal(error.line, 5)
      assert.equal(error.col, 0)
      assert.equal(error.filename, join(fs.basePath, 'eval.edge'))
    }
  })

  test('report component file errors', async ({ assert }) => {
    assert.plan(4)

    await fs.add(
      'button.edge',
      dedent`
      <button
        style="color: {{ getColor() }}"
      >
      </button>
    `
    )

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>
      @!component('button')
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    try {
      template.render('eval.edge', {})
    } catch (error) {
      assert.equal(error.message, 'getColor is not a function')
      assert.equal(error.line, 2)
      assert.equal(error.col, 0)
      assert.equal(error.filename, join(fs.basePath, 'button.edge'))
    }
  })

  test('point error back to the caller when props validation fails', async ({ assert }) => {
    assert.plan(4)

    await fs.add(
      'button.edge',
      `{{ $props.validate('text', () => {
				raise('text prop is required', $caller)
			}) }}`
    )

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @!component('button')
    `
    )

    const template = new Template(
      compiler,
      {
        raise: (message: string, options: any) => {
          throw new EdgeError(message, 'E_RUNTIME_EXCEPTION', options)
        },
      },
      {},
      processor
    )
    try {
      template.render('eval.edge', {})
    } catch (error) {
      assert.equal(error.message, 'text prop is required')
      assert.equal(error.line, 3)
      assert.equal(error.col, 0)
      assert.equal(error.filename, join(fs.basePath, 'eval.edge'))
    }
  })
})

test.group('Component | context API', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('inject data from the component to the parent', async ({ assert }) => {
    await fs.add(
      'modal.edge',
      dedent`
			@if(needsHandler)
				@inject({ closeHandler: 'closePopup' })
			@endif
			{{{ $slots.main() }}}
		`
    )

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @component('modal', needsHandler = true)
      	<p>{{ $context.closeHandler }}</p>
      @endcomponent
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    const output = template.render<string>('eval.edge', {}).trim()
    assert.stringEqual(
      output,
      dedent`
		<p> Some content </p>

			<p>closePopup</p>
		`
    )
  })

  test('do not leak context out of the component scope', async ({ assert }) => {
    await fs.add(
      'modal.edge',
      dedent`
			@if(needsHandler)
				@inject({ closeHandler: 'closePopup' })
			@endif
			{{{ $slots.main() }}}
		`
    )

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @component('modal', needsHandler = true)
      	<p>{{ $context.closeHandler }}</p>
      @endcomponent

      <p>{{ $context.closeHandler }}</p>
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    const output = template.render<string>('eval.edge', {}).trim()
    assert.stringEqual(
      output,
      dedent`
		<p> Some content </p>

			<p>closePopup</p>

		<p>undefined</p>
		`
    )
  })

  test('do not leak context across sibling components', async ({ assert }) => {
    await fs.add(
      'modal.edge',
      dedent`
			@if(needsHandler)
				@inject({ closeHandler: 'closePopup' })
			@endif
			{{{ $slots.main() }}}
		`
    )

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @component('modal', needsHandler = true)
      	<p>{{ $context.closeHandler }}</p>
      @endcomponent

      @component('modal', needsHandler = false)
      	<p>{{ $context.closeHandler }}</p>
      @endcomponent
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    const output = template.render<string>('eval.edge', {}).trim()
    assert.stringEqual(
      output,
      dedent`
		<p> Some content </p>

			<p>closePopup</p>
			<p>undefined</p>
		`
    )
  })

  test('do not leak context across sibling components within a nested component', async ({
    assert,
  }) => {
    await fs.add(
      'modal.edge',
      dedent`
			@if(needsHandler)
				@inject({ closeHandler: 'closePopup' })
			@endif
			{{{ $slots.main() }}}
		`
    )

    await fs.add(
      'wrapper.edge',
      dedent`
			@inject({})
			{{{ $slots.main() }}}
		`
    )

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @component('wrapper')
	      @component('modal', needsHandler = true)
	      	<p>{{ $context.closeHandler }}</p>
	      @endcomponent

	      @component('modal', needsHandler = false)
	      	<p>{{ $context.closeHandler }}</p>
	      @endcomponent
	    @end
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    const output = template.render<string>('eval.edge', {}).trim()
    assert.stringEqual(
      output,
      dedent`
		<p> Some content </p>

		  	<p>closePopup</p>
		  	<p>undefined</p>
		`
    )
  })

  test('share context with nested components', async ({ assert }) => {
    await fs.add(
      'modal.edge',
      dedent`
			@inject({})
			{{{ $slots.main() }}}
		`
    )

    await fs.add(
      'modalsRoot.edge',
      dedent`
			@inject({ closeHandler: 'closePopup' })
			{{{ $slots.main() }}}
		`
    )

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @component('modalsRoot')
	      @component('modal')
	      	<p>{{ $context.closeHandler }}</p>
	      @endcomponent

	      @component('modal')
	      	<p>{{ $context.closeHandler }}</p>
	      @endcomponent
	    @end
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    const output = template.render<string>('eval.edge', {}).trim()
    assert.stringEqual(
      output,
      dedent`
		<p> Some content </p>
		  	<p>closePopup</p>
		  	<p>closePopup</p>
		`
    )
  })

  test('share context with partials', async ({ assert }) => {
    await fs.add(
      'modal.edge',
      dedent`
			@inject({})
			{{{ $slots.main() }}}
		`
    )

    await fs.add(
      'modalsRoot.edge',
      dedent`
			@inject({ closeHandler: 'closePopup' })
			{{{ $slots.main() }}}
		`
    )

    await fs.add('button.edge', dedent`<button>{{ $context.closeHandler }}</button>`)

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @component('modalsRoot')
	      @component('modal')
	      	@include('button')
	      @endcomponent

	      @component('modal')
	      	@include('button')
	      @endcomponent
	    @end
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    const output = template.render<string>('eval.edge', {}).trim()
    assert.stringEqual(
      output,
      dedent`
		<p> Some content </p>
		<button>closePopup</button>
		<button>closePopup</button>
		`
    )
  })

  test('share context with components', async ({ assert }) => {
    await fs.add(
      'modal.edge',
      dedent`
			@inject({})
			{{{ $slots.main() }}}
		`
    )

    await fs.add(
      'modalsRoot.edge',
      dedent`
			@inject({ closeHandler: 'closePopup' })
			{{{ $slots.main() }}}
		`
    )

    await fs.add('button.edge', dedent`<button>{{ $context.closeHandler }}</button>`)

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>

      @component('modalsRoot')
	      @component('modal')
	      	@!component('button')
	      @endcomponent

	      @component('modal')
	      	@!component('button')
	      @endcomponent
	    @end
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    const output = template.render<string>('eval.edge', {}).trim()
    assert.stringEqual(
      output,
      dedent`
		<p> Some content </p>
		<button>closePopup</button>
		<button>closePopup</button>
		`
    )
  })

  test('raise error when trying to use inject outside of the component scope', async ({
    assert,
  }) => {
    assert.plan(3)

    await fs.add(
      'button.edge',
      dedent`
			I will render a button

			And then try to inject some values

			@inject({ foo: 'bar' })
		`
    )

    await fs.add(
      'eval.edge',
      dedent`
      <p> Some content </p>
      @include('button')
    `
    )

    const template = new Template(compiler, {}, {}, processor)
    try {
      template.render<string>('eval.edge', {})
    } catch (error) {
      assert.equal(error.message, 'Cannot use "@inject" outside of a component scope')
      assert.equal(error.filename, join(fs.basePath, 'button.edge'))
      assert.equal(error.line, 5)
    }
  })
})
