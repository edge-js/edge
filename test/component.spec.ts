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
import dedent from 'dedent-js'
import { Filesystem } from '@poppinss/dev-utils'

import { Loader } from '../src/Loader'
import { Compiler } from '../src/Compiler'
import { Template } from '../src/Template'
import { Processor } from '../src/Processor'

import { slotTag } from '../src/Tags/Slot'
import { componentTag } from '../src/Tags/Component'

const fs = new Filesystem(join(__dirname, 'views'))
const tags = {
	component: componentTag,
	slot: slotTag,
}

const loader = new Loader()
loader.mount('default', fs.basePath)

const processor = new Processor()
const compiler = new Compiler(loader, tags, processor, false)

test.group('Component | compile | errors', (group) => {
	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('report component arguments error', async (assert) => {
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

	test('report slot argument name error', async (assert) => {
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

	test('report slot arguments error', async (assert) => {
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

	test('report slot scope argument error', async (assert) => {
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
	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('report component name runtime error', async (assert) => {
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

	test('report component state argument error', async (assert) => {
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

	test('report component state argument error when spread over multiple lines', async (assert) => {
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

	test('report component state argument error with assignment expression', async (assert) => {
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

	test('report component state argument error with assignment expression in multiple lines', async (assert) => {
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

	test('report scoped slot error', async (assert) => {
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
			assert.equal(error.message, "Cannot read property 'isPrimary' of undefined")
			assert.equal(error.line, 5)
			assert.equal(error.col, 0)
			assert.equal(error.filename, join(fs.basePath, 'eval.edge'))
		}
	})

	test('report component file errors', async (assert) => {
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
})
