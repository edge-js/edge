/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { Props } from '../src/Component/Props'

test.group('Props', () => {
	test('get props value', (assert) => {
		const props = new Props({
			component: 'foo',
			state: { title: 'Hello' },
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})

		assert.equal(props.get('title'), 'Hello')
	})

	test('find if props has value', (assert) => {
		const props = new Props({
			component: 'foo',
			state: { title: 'Hello' },
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})

		assert.isTrue(props.has('title'))
	})

	test('raise error when prop value is missing', (assert) => {
		assert.plan(3)

		const props = new Props({
			component: 'foo',
			state: { title: 'Hello' },
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})

		try {
			props.get('age')
		} catch (error) {
			assert.equal(error.message, '"age" prop is required in order to render the "foo" component')
			assert.equal(error.filename, 'bar.edge')
			assert.equal(error.line, 1)
		}
	})

	test('cherry pick values from the props', (assert) => {
		const props = new Props({
			component: 'foo',
			state: { title: 'Hello', label: 'Hello world', actionText: 'Confirm' },
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})

		assert.deepEqual(props.only(['label', 'actionText']), {
			label: 'Hello world',
			actionText: 'Confirm',
		})
	})

	test('get values except for the defined keys from the props', (assert) => {
		const props = new Props({
			component: 'foo',
			state: { title: 'Hello', label: 'Hello world', actionText: 'Confirm' },
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})

		assert.deepEqual(props.except(['label', 'actionText']), {
			title: 'Hello',
		})
	})

	test('serialize props to html attributes', (assert) => {
		const props = new Props({
			component: 'foo',
			state: {
				class: ['foo', 'bar'],
				onclick: 'foo = bar',
			},
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})

		assert.equal(props.serialize().value, ' class="foo bar" onclick="foo = bar"')
	})

	test('serialize by merging custom properties', (assert) => {
		const props = new Props({
			component: 'foo',
			state: {
				class: ['foo', 'bar'],
				onclick: 'foo = bar',
			},
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})

		assert.equal(props.serialize({ id: '1' }).value, ' class="foo bar" onclick="foo = bar" id="1"')
	})

	test('serialize specific keys to html attributes', (assert) => {
		const props = new Props({
			component: 'foo',
			state: {
				class: ['foo', 'bar'],
				onclick: 'foo = bar',
			},
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})

		assert.equal(props.serializeOnly(['class']).value, ' class="foo bar"')
	})

	test('serialize specific keys to merge custom properties', (assert) => {
		const props = new Props({
			component: 'foo',
			state: {
				class: ['foo', 'bar'],
				onclick: 'foo = bar',
			},
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})

		assert.equal(props.serializeOnly(['class'], { id: '1' }).value, ' class="foo bar" id="1"')
	})

	test('serialize all except defined keys to html attributes', (assert) => {
		const props = new Props({
			component: 'foo',
			state: {
				class: ['foo', 'bar'],
				onclick: 'foo = bar',
			},
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})

		assert.equal(props.serializeExcept(['class']).value, ' onclick="foo = bar"')
	})

	test('serialize specific keys to merge custom properties', (assert) => {
		const props = new Props({
			component: 'foo',
			state: {
				class: ['foo', 'bar'],
				onclick: 'foo = bar',
			},
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})

		assert.equal(props.serializeExcept(['class'], { id: '1' }).value, ' onclick="foo = bar" id="1"')
	})

	test('copy state properties to the props class', (assert) => {
		const props = new Props({
			component: 'foo',
			state: {
				class: ['foo', 'bar'],
				onclick: 'foo = bar',
			},
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})

		assert.deepEqual(props['class'], ['foo', 'bar'])
		assert.deepEqual(props['onclick'], 'foo = bar')
	})

	test('access nested state properties from the props instance', (assert) => {
		const props = new Props({
			component: 'foo',
			state: {
				user: {
					name: 'virk',
				},
			},
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})

		assert.equal(props['user']['name'], 'virk')
	})

	test('do not raise error when state is undefined', () => {
		new Props({
			component: 'foo',
			state: undefined,
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})
	})

	test('do not raise error when state is null', () => {
		new Props({
			component: 'foo',
			state: null,
			caller: {
				filename: 'bar.edge',
				lineNumber: 1,
			},
		})
	})
})
