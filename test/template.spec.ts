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

import { Loader } from '../src/Loader'
import { Context } from '../src/Context'
import { Template } from '../src/Template'
import { Compiler } from '../src/Compiler'
import { slotTag } from '../src/Tags/Slot'
import { Processor } from '../src/Processor'
import { includeTag } from '../src/Tags/Include'
import { componentTag } from '../src/Tags/Component'

import './assert-extend'

const tags = { slot: slotTag, component: componentTag, include: includeTag }
const fs = new Filesystem(join(__dirname, 'views'))

const loader = new Loader()
loader.mount('default', fs.basePath)

test.group('Template', (group) => {
	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('run template using the given state', async (assert) => {
		await fs.add('foo.edge', 'Hello {{ username }}')
		const processor = new Processor()
		const compiler = new Compiler(loader, tags, processor, { cache: false })
		const output = new Template(compiler, {}, {}, processor).render('foo', { username: 'virk' })
		assert.equal(output.trim(), 'Hello virk')
	})

	test('run template with shared state', async (assert) => {
		await fs.add('foo.edge', 'Hello {{ getUsername() }}')
		const processor = new Processor()
		const compiler = new Compiler(loader, tags, processor, { cache: false })

		const output = new Template(
			compiler,
			{ username: 'virk' },
			{
				getUsername() {
					return this.username.toUpperCase()
				},
			},
			processor
		).render('foo', {})
		assert.equal(output.trim(), 'Hello VIRK')
	})

	test('run partial inside existing state', async (assert) => {
		await fs.add('foo.edge', 'Hello {{ username }}')

		const processor = new Processor()
		const compiler = new Compiler(loader, tags, processor, { cache: false })
		const template = new Template(compiler, {}, {}, processor)

		const output = template.renderInline('foo')(template, { username: 'virk' }, new Context())
		assert.equal(output.trim(), 'Hello virk')
	})

	test('pass local variables to inline templates', async (assert) => {
		await fs.add('foo.edge', 'Hello {{ user.username }}')

		const processor = new Processor()
		const compiler = new Compiler(loader, tags, processor, { cache: false })
		const template = new Template(compiler, {}, {}, processor)

		const user = { username: 'virk' }
		const output = template.renderInline('foo', 'user')(template, {}, new Context(), user)
		assert.equal(output.trim(), 'Hello virk')
	})

	test('process file names starting with u', async (assert) => {
		await fs.add('users.edge', 'Hello {{ user.username }}')

		const processor = new Processor()
		const compiler = new Compiler(loader, tags, processor, { cache: false })
		const template = new Template(compiler, {}, {}, processor)

		const user = { username: 'virk' }
		const output = template.render('users', { user })
		assert.equal(output.trim(), 'Hello virk')
	})

	test('execute output processor function', async (assert) => {
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
		const output = template.render('users', { user })
		assert.equal(output.trim(), 'Hello virk')
	})

	test('use return value of the output processor function', async (assert) => {
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
		const output = template.render('users', { user })
		assert.equal(output.trim(), 'HELLO VIRK')
	})
})
