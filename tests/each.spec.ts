/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { asyncEach, each } from '../src/utils.js'

test.group('async each', () => {
  test('iterate over array', async ({ assert }) => {
    let pairs: any = {}

    await asyncEach(['hi', 'hello', 'hey'], async (value, index) => {
      pairs[index] = value
    })

    assert.deepEqual(pairs, {
      0: 'hi',
      1: 'hello',
      2: 'hey',
    })
  })

  test('iterate over object', async ({ assert }) => {
    let pairs: any = {}

    await asyncEach({ eat: 'banana', goFor: 'walk' }, async (value, index) => {
      pairs[index] = value
    })

    assert.deepEqual(pairs, {
      eat: 'banana',
      goFor: 'walk',
    })
  })

  test('iterate over string', async ({ assert }) => {
    let pairs: any = {}

    await asyncEach('hello', async (value, index) => {
      pairs[index] = value
    })

    assert.deepEqual(pairs, {
      0: 'h',
      1: 'e',
      2: 'l',
      3: 'l',
      4: 'o',
    })
  })

  test('ignore null value', async ({ assert }) => {
    let pairs: any = {}

    await asyncEach(null, async (value, index) => {
      pairs[index] = value
    })

    assert.deepEqual(pairs, {})
  })

  test('ignore undefined value', async ({ assert }) => {
    let pairs: any = {}

    await asyncEach(undefined, async (value, index) => {
      pairs[index] = value
    })

    assert.deepEqual(pairs, {})
  })

  test('ignore numbers', async ({ assert }) => {
    let pairs: any = {}

    await asyncEach(22, async (value, index) => {
      pairs[index] = value
    })

    assert.deepEqual(pairs, {})
  })
})

test.group('each', () => {
  test('iterate over array', ({ assert }) => {
    let pairs: any = {}

    each(['hi', 'hello', 'hey'], (value, index) => {
      pairs[index] = value
    })

    assert.deepEqual(pairs, {
      0: 'hi',
      1: 'hello',
      2: 'hey',
    })
  })

  test('iterate over object', ({ assert }) => {
    let pairs: any = {}

    each({ eat: 'banana', goFor: 'walk' }, (value, index) => {
      pairs[index] = value
    })

    assert.deepEqual(pairs, {
      eat: 'banana',
      goFor: 'walk',
    })
  })

  test('iterate over string', ({ assert }) => {
    let pairs: any = {}

    each('hello', (value, index) => {
      pairs[index] = value
    })

    assert.deepEqual(pairs, {
      0: 'h',
      1: 'e',
      2: 'l',
      3: 'l',
      4: 'o',
    })
  })

  test('ignore null value', ({ assert }) => {
    let pairs: any = {}

    each(null, (value, index) => {
      pairs[index] = value
    })

    assert.deepEqual(pairs, {})
  })

  test('ignore undefined value', ({ assert }) => {
    let pairs: any = {}

    each(undefined, (value, index) => {
      pairs[index] = value
    })

    assert.deepEqual(pairs, {})
  })

  test('ignore numbers', ({ assert }) => {
    let pairs: any = {}

    each(22, (value, index) => {
      pairs[index] = value
    })

    assert.deepEqual(pairs, {})
  })
})
