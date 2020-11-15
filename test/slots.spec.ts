/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { Slots } from '../src/Component/Slots'

test.group('Slots', () => {
	test('render slot', (assert) => {
		const slots = new Slots({
			component: 'foo',
			slots: {
				main: () => 'hello',
			},
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})

		assert.equal(slots.render('main').value, 'hello')
	})

	test('raise error when slot is missing', (assert) => {
		const slots = new Slots({
			component: 'foo',
			slots: {},
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})

		try {
			slots.render('main')
		} catch (error) {
			assert.equal(error.message, '"main" slot is required in order to render the "foo" component')
			assert.equal(error.filename, 'bar.edge')
			assert.equal(error.line, 1)
		}
	})

	test('return empty string when slot is missing', (assert) => {
		const slots = new Slots({
			component: 'foo',
			slots: {},
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})

		assert.equal(slots.renderIfExists('main'), '')
	})

	test('access slots directly', (assert) => {
		const slots = new Slots({
			component: 'foo',
			slots: {
				main: () => 'hello',
			},
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})

		assert.equal(slots['main'](), 'hello')
	})
})
