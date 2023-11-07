/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { ComponentProps } from '../src/component/props.js'

test.group('ComponentProps', () => {
  test('get all props', ({ assert }) => {
    const props = ComponentProps.create({ title: 'Hello' })
    assert.deepEqual(props.all(), { title: 'Hello' })
  })

  test('get value for a given key', ({ assert }) => {
    const props = ComponentProps.create({ title: 'Hello' })
    assert.equal(props.get('title'), 'Hello')
    assert.equal(props.title, 'Hello')
  })

  test('cherry pick values from the props', ({ assert }) => {
    const props = ComponentProps.create({
      title: 'Hello',
      label: 'Hello world',
      actionText: 'Confirm',
    })

    assert.deepEqual(props.only(['label', 'actionText']).all(), {
      label: 'Hello world',
      actionText: 'Confirm',
    })
  })

  test('get values except for the defined keys from the props', ({ assert }) => {
    const props = ComponentProps.create({
      title: 'Hello',
      label: 'Hello world',
      actionText: 'Confirm',
    })

    assert.deepEqual(props.except(['label', 'actionText']).all(), {
      title: 'Hello',
    })
  })

  test('serialize props to html attributes', ({ assert }) => {
    const props = ComponentProps.create({
      class: ['foo', 'bar'],
      onclick: 'foo = bar',
    })
    assert.equal(props.toAttrs().value, 'class="foo bar" onclick="foo = bar"')
  })

  test('serialize by merging custom properties', ({ assert }) => {
    const props = ComponentProps.create({
      class: ['foo', 'bar'],
      onclick: 'foo = bar',
    })
    assert.equal(
      props.merge({ id: '1' }).toAttrs().value,
      'id="1" class="foo bar" onclick="foo = bar"'
    )
  })

  test('serialize specific keys to html attributes', ({ assert }) => {
    const props = ComponentProps.create({
      class: ['foo', 'bar'],
      onclick: 'foo = bar',
    })
    assert.equal(props.only(['class']).toAttrs().value, 'class="foo bar"')
  })

  test('serialize specific keys and merge custom properties', ({ assert }) => {
    const props = ComponentProps.create({
      class: ['foo', 'bar'],
      onclick: 'foo = bar',
    })
    assert.equal(props.only(['class']).merge({ id: '1' }).toAttrs().value, 'id="1" class="foo bar"')
  })

  test('serialize all except defined keys to html attributes', ({ assert }) => {
    const props = ComponentProps.create({
      class: ['foo', 'bar'],
      onclick: 'foo = bar',
    })

    assert.equal(props.except(['class']).toAttrs().value, 'onclick="foo = bar"')
  })

  test('serialize specific keys and merge custom properties', ({ assert }) => {
    const props = ComponentProps.create({
      class: ['foo', 'bar'],
      onclick: 'foo = bar',
    })

    assert.equal(
      props.except(['class']).merge({ id: '1' }).toAttrs().value,
      'id="1" onclick="foo = bar"'
    )
  })

  test('merge default and user supplied classes', ({ assert }) => {
    const props = ComponentProps.create({
      class: ['foo', 'bar'],
      onclick: 'foo = bar',
    })

    assert.equal(
      props
        .except(['onclick'])
        .merge({ class: ['foo', 'baz'] })
        .toAttrs().value,
      'class="foo baz bar"'
    )
  })

  test('merge default and user supplied classes as object', ({ assert }) => {
    const props = ComponentProps.create({
      class: [
        'foo',
        {
          'input-error': false,
          'input-disabled': true,
          'input-large': false,
          'input-medium': true,
          'input-rounded': true,
        },
      ],
      onclick: 'foo = bar',
    })

    assert.equal(
      props
        .except(['onclick'])
        .merge({ class: ['foo', 'input-error'] })
        .toAttrs().value,
      'class="foo input-error input-disabled input-medium input-rounded"'
    )
  })

  test('mergeUnless a conditional is true', ({ assert }) => {
    const props = ComponentProps.create({
      class: [
        'foo',
        {
          'input-error': false,
          'input-disabled': true,
          'input-large': false,
          'input-medium': true,
          'input-rounded': true,
        },
      ],
      ignoreExistingClasses: true,
      onclick: 'foo = bar',
    })

    assert.equal(
      props
        .except(['onclick', 'ignoreExistingClasses'])
        .mergeUnless(props.get('ignoreExistingClasses'), { class: ['foo', 'input-error'] })
        .toAttrs().value,
      'class="foo input-disabled input-medium input-rounded"'
    )
  })

  test('mergeIf a conditional is true', ({ assert }) => {
    const props = ComponentProps.create({
      class: [
        'foo',
        {
          'input-error': false,
          'input-disabled': true,
          'input-large': false,
          'input-medium': true,
          'input-rounded': true,
        },
      ],
      applyDefaults: true,
      onclick: 'foo = bar',
    })

    assert.equal(
      props
        .except(['onclick', 'applyDefaults'])
        .mergeIf(props.get('applyDefaults'), { class: ['foo', 'input-error'] })
        .toAttrs().value,
      'class="foo input-error input-disabled input-medium input-rounded"'
    )
  })
})
