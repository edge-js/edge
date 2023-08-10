/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { StringifiedObject } from '../src/utils.js'

test.group('StringifiedObject', () => {
  test('add string as a key-value pair to object', ({ assert }) => {
    const stringified = new StringifiedObject()
    stringified.add('username', "'virk'")
    assert.equal(stringified.flush(), "{ username: 'virk' }")
  })

  test('add number as a key-value pair to object', ({ assert }) => {
    const stringified = new StringifiedObject()
    stringified.add('username', '22')
    assert.equal(stringified.flush(), '{ username: 22 }')
  })

  test('add boolean as a key-value pair to object', ({ assert }) => {
    const stringified = new StringifiedObject()
    stringified.add('username', 'true')
    assert.equal(stringified.flush(), '{ username: true }')
  })

  test('add object as a key-value pair to object', ({ assert }) => {
    const stringified = new StringifiedObject()
    stringified.add('username', '{ age: 22 }')
    assert.equal(stringified.flush(), '{ username: { age: 22 } }')
  })

  test('add array as a key-value pair to object', ({ assert }) => {
    const stringified = new StringifiedObject()
    stringified.add('username', '[10, 20]')
    assert.equal(stringified.flush(), '{ username: [10, 20] }')
  })
})
