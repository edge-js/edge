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
	test('find if props has value', (assert) => {
		const props = new Props({ title: 'Hello' })
		assert.isTrue(props.has('title'))
	})

	test('cherry pick values from the props', (assert) => {
		const props = new Props({ title: 'Hello', label: 'Hello world', actionText: 'Confirm' })

		assert.deepEqual(props.only(['label', 'actionText']), {
			label: 'Hello world',
			actionText: 'Confirm',
		})
	})

	test('get values except for the defined keys from the props', (assert) => {
		const props = new Props({ title: 'Hello', label: 'Hello world', actionText: 'Confirm' })

		assert.deepEqual(props.except(['label', 'actionText']), {
			title: 'Hello',
		})
	})

	test('serialize props to html attributes', (assert) => {
		const props = new Props({
			class: ['foo', 'bar'],
			onclick: 'foo = bar',
		})
		assert.equal(props.serialize().value, ' class="foo bar" onclick="foo = bar"')
	})

	test('serialize by merging custom properties', (assert) => {
		const props = new Props({
			class: ['foo', 'bar'],
			onclick: 'foo = bar',
		})
		assert.equal(props.serialize({ id: '1' }).value, ' class="foo bar" onclick="foo = bar" id="1"')
	})

	test('serialize specific keys to html attributes', (assert) => {
		const props = new Props({
			class: ['foo', 'bar'],
			onclick: 'foo = bar',
		})
		assert.equal(props.serializeOnly(['class']).value, ' class="foo bar"')
	})

	test('serialize specific keys to merge custom properties', (assert) => {
		const props = new Props({
			class: ['foo', 'bar'],
			onclick: 'foo = bar',
		})
		assert.equal(props.serializeOnly(['class'], { id: '1' }).value, ' class="foo bar" id="1"')
	})

	test('serialize all except defined keys to html attributes', (assert) => {
		const props = new Props({
			class: ['foo', 'bar'],
			onclick: 'foo = bar',
		})

		assert.equal(props.serializeExcept(['class']).value, ' onclick="foo = bar"')
	})

	test('serialize specific keys to merge custom properties', (assert) => {
		const props = new Props({
			class: ['foo', 'bar'],
			onclick: 'foo = bar',
		})

		assert.equal(props.serializeExcept(['class'], { id: '1' }).value, ' onclick="foo = bar" id="1"')
	})

	test('copy state properties to the props class', (assert) => {
		const props = new Props({
			class: ['foo', 'bar'],
			onclick: 'foo = bar',
		})

		assert.deepEqual(props['class'], ['foo', 'bar'])
		assert.deepEqual(props['onclick'], 'foo = bar')
	})

	test('access nested state properties from the props instance', (assert) => {
		const props = new Props({
			user: {
				name: 'virk',
			},
		})

		assert.equal(props['user']['name'], 'virk')
	})

	test('do not raise error when state is undefined', () => {
		new Props(undefined)
	})

	test('do not raise error when state is null', () => {
		new Props(null)
	})
})
