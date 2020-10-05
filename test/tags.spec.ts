/*
 * edge-parser
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

import * as tags from '../src/Tags'
import { Loader } from '../src/Loader'
import { Compiler } from '../src/Compiler'
import { Processor } from '../src/Processor'

const fs = new Filesystem(join(__dirname, 'views'))

const loader = new Loader()
loader.mount('default', fs.basePath)

const processor = new Processor()
const compiler = new Compiler(loader, tags, processor)

test.group('If tag', (group) => {
	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('raise errors on correct line with if tag', async (assert) => {
		assert.plan(2)

		const templateContent = dedent`Hello everyone!
      We are writing a bad if condition

      @if(foo bar)
      @endif`

		await fs.add('foo.edge', templateContent)
		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(error.message, 'Unexpected token ')
			assert.equal(error.line, 4)
		}
	})

	test('raise errors when using sequence expression', async (assert) => {
		assert.plan(2)

		const templateContent = dedent`Hello everyone!
      We are writing a bad if condition

      @if(foo, bar)
      @endif`

		await fs.add('foo.edge', templateContent)
		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(error.line, 4)
			assert.equal(error.message, '"foo, bar" is not a valid argument type for the @if tag')
		}
	})

	test('raise errors when expression was never closed', async (assert) => {
		assert.plan(1)

		const templateContent = dedent`Hello everyone!
      We are writing a bad if condition

      @if(foo, bar)`

		await fs.add('foo.edge', templateContent)
		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(error.message, 'Unclosed tag if')
		}
	})
})

test.group('Include', (group) => {
	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('raise errors on correct line with include tag', async (assert) => {
		assert.plan(1)

		const templateContent = dedent`We are writing a bad include condition
    @include(foo bar)`

		await fs.add('foo.edge', templateContent)
		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(
				error.stack.split('\n')[1],
				`    at anonymous (${join(fs.basePath, 'foo.edge')}:2:13)`
			)
		}
	})

	test('raise errors when using sequence expression', async (assert) => {
		assert.plan(2)

		const templateContent = "@include('foo', 'bar')"

		await fs.add('foo.edge', templateContent)
		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(
				error.stack.split('\n')[1],
				`    at anonymous (${join(fs.basePath, 'foo.edge')}:1:9)`
			)
			assert.equal(
				error.message,
				"\"'foo', 'bar'\" is not a valid argument type for the @include tag"
			)
		}
	})
})

test.group('IncludeIf', (group) => {
	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('raise errors when not passing sequence expression', async (assert) => {
		assert.plan(2)

		const templateContent = dedent`We are writing a bad include condition
    @includeIf(foo)`

		await fs.add('foo.edge', templateContent)
		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(error.message, '"foo" is not a valid argument type for the @includeIf tag')
			assert.equal(
				error.stack.split('\n')[1],
				`    at anonymous (${join(fs.basePath, 'foo.edge')}:2:11)`
			)
		}
	})

	test('raise errors when passing more than 2 arguments', async (assert) => {
		assert.plan(2)

		const templateContent = dedent`We are writing a bad include condition
    @includeIf(foo, bar, baz)`

		await fs.add('foo.edge', templateContent)
		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(error.message, '@includeIf expects a total of 2 arguments')
			assert.equal(
				error.stack.split('\n')[1],
				`    at anonymous (${join(fs.basePath, 'foo.edge')}:2:11)`
			)
		}
	})

	test('raise errors when 1st argument is a sequence expression', async (assert) => {
		assert.plan(2)

		const templateContent = dedent`We are writing a bad include condition
    @includeIf((foo, bar), baz)`

		await fs.add('foo.edge', templateContent)
		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(
				error.message,
				'"SequenceExpression" is not a valid 1st argument type for the @includeIf tag'
			)
			assert.equal(
				error.stack.split('\n')[1],
				`    at anonymous (${join(fs.basePath, 'foo.edge')}:2:12)`
			)
		}
	})
})

test.group('Component', (group) => {
	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('raise errors when slot name is not defined as a literal', async (assert) => {
		assert.plan(2)

		const templateContent = dedent`@component('bar')
      @slot(hello)
      @endslot

      @endcomponent`

		await fs.add('foo.edge', templateContent)
		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(
				error.stack.split('\n')[1],
				`    at anonymous (${join(fs.basePath, 'foo.edge')}:2:6)`
			)
			assert.equal(error.message, '"hello" is not a valid argument type for the @slot tag')
		}
	})

	test('raise errors when slot has more than 2 arguments', async (assert) => {
		assert.plan(2)

		const templateContent = dedent`@component('bar')
      @slot('hello', props, propsAgain)
      @endslot

      @endcomponent`

		await fs.add('foo.edge', templateContent)
		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(
				error.stack.split('\n')[1],
				`    at anonymous (${join(fs.basePath, 'foo.edge')}:2:6)`
			)
			assert.equal(error.message, 'maximum of 2 arguments are allowed for @slot tag')
		}
	})

	test('raise errors when slot first argument is not a literal', async (assert) => {
		assert.plan(2)

		const templateContent = dedent`@component('bar')
      @slot(hello, props)
      @endslot

      @endcomponent`

		await fs.add('foo.edge', templateContent)
		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(
				error.stack.split('\n')[1],
				`    at anonymous (${join(fs.basePath, 'foo.edge')}:2:6)`
			)
			assert.equal(error.message, 'slot name must be a valid string literal')
		}
	})

	test('raise errors when slot 2nd argument is not an identifier', async (assert) => {
		assert.plan(2)

		const templateContent = dedent`@component('bar')
      @slot(
        'hello',
        'props'
      )
      @endslot

      @endcomponent`

		await fs.add('foo.edge', templateContent)
		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(
				error.stack.split('\n')[1],
				`    at anonymous (${join(fs.basePath, 'foo.edge')}:4:2)`
			)
			assert.equal(error.message, '"\'props\'" is not valid prop identifier for @slot tag')
		}
	})

	test('raise error when slot is inside a conditional block', async (assert) => {
		assert.plan(2)

		const templateContent = dedent`@component('bar')

      @if(username)
        @slot('header')
        @endslot
      @endif

      @endcomponent`

		await fs.add('foo.edge', templateContent)
		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(
				error.stack.split('\n')[1],
				`    at anonymous (${join(fs.basePath, 'foo.edge')}:4:8)`
			)
			assert.equal(
				error.message,
				'@slot tag must appear as top level tag inside the @component tag'
			)
		}
	})
})

test.group('Layouts', (group) => {
	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('raise error when section is nested inside conditional block', async (assert) => {
		assert.plan(2)

		const templateContent = dedent`@layout('master')

      @if(username)
        @section('body')
          <p> Hello world </p>
        @endsection
      @endif`

		await fs.add('foo.edge', templateContent)
		await fs.add('master.edge', "@!section('body')")

		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(
				error.stack.split('\n')[1],
				`    at anonymous (${join(fs.basePath, 'foo.edge')}:3:4)`
			)
			assert.equal(
				error.message,
				'Template extending a layout can only use "@section" or "@set" tags as top level nodes'
			)
		}
	})

	test('raise error when section is not a top level tag inside nested layouts', async (assert) => {
		assert.plan(2)

		const templateContent = dedent`@layout('master')

      @if(username)
        @section('body')
          <p> Hello world </p>
        @endsection
      @endif`

		await fs.add('foo.edge', templateContent)
		await fs.add('master.edge', "@layout('super')")
		await fs.add('super.edge', "@!section('body')")

		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(
				error.stack.split('\n')[1],
				`    at anonymous (${join(fs.basePath, 'foo.edge')}:3:4)`
			)
			assert.equal(
				error.message,
				'Template extending a layout can only use "@section" or "@set" tags as top level nodes'
			)
		}
	})

	test('raise error when there are raw content outside sections', async (assert) => {
		assert.plan(2)

		const templateContent = dedent`@layout('master')
      <p> Hello world </p>`

		await fs.add('foo.edge', templateContent)
		await fs.add('master.edge', "@!section('body')")

		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(
				error.stack.split('\n')[1],
				`    at anonymous (${join(fs.basePath, 'foo.edge')}:2:0)`
			)
			assert.equal(
				error.message,
				'Template extending a layout can only use "@section" or "@set" tags as top level nodes'
			)
		}
	})
})

test.group('Each tag', (group) => {
	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('raise errors when arg is not a binary expression', async (assert) => {
		assert.plan(2)

		const templateContent = dedent`Hello everyone!
      We are writing a bad each condition

      @each(users)
      @endeach`

		await fs.add('foo.edge', templateContent)
		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(error.message, '"users" is not valid expression for the @each tag')
			assert.equal(error.line, 4)
		}
	})

	test('raise errors when lhs of binary expression is not an indentifier', async (assert) => {
		assert.plan(2)

		const templateContent = dedent`Hello everyone!
      We are writing a bad each condition

      @each('user' in users)
      @endeach`

		await fs.add('foo.edge', templateContent)
		try {
			compiler.compile('foo')
		} catch (error) {
			assert.equal(error.message, 'invalid left hand side "Literal" expression for the @each tag')
			assert.equal(error.line, 4)
		}
	})
})
