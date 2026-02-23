/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EOL } from 'node:os'
import { test } from '@japa/runner'
import Stacks from '../src/edge/stacks.js'

test.group('Stacks', () => {
  test('create a stack placeholder', ({ assert }) => {
    const stacks = new Stacks()
    assert.equal(stacks.create('js'), '<!-- @edge.stacks.js -->')
  })

  test('create multiple stack placeholders', ({ assert }) => {
    const stacks = new Stacks()
    assert.equal(stacks.create('js'), '<!-- @edge.stacks.js -->')
    assert.equal(stacks.create('css'), '<!-- @edge.stacks.css -->')
  })

  test('raise error when same stack is created multiple times', ({ assert }) => {
    const stacks = new Stacks()

    stacks.create('js')
    assert.throws(() => stacks.create('js'), 'Cannot declare stack "js" for multiple times')
  })

  test('push contents to stack', ({ assert }) => {
    const stacks = new Stacks()

    const contents = stacks.create('js')
    stacks.pushTo('js', 'hello world')

    assert.equal(stacks.fillPlaceholders(contents), 'hello world')
  })

  test('push contents multiple times to stack', ({ assert }) => {
    const stacks = new Stacks()

    const contents = stacks.create('js')
    stacks.pushTo('js', 'hello world')
    stacks.pushTo('js', 'hi world')

    assert.equal(stacks.fillPlaceholders(contents), `hello world${EOL}hi world`)
  })

  test('push contents before creating the stack', ({ assert }) => {
    const stacks = new Stacks()

    stacks.pushTo('js', 'hello world')
    stacks.pushTo('js', 'hi world')
    const contents = stacks.create('js')

    assert.equal(stacks.fillPlaceholders(contents), `hello world${EOL}hi world`)
  })

  test('push contents to the top of a stack', ({ assert }) => {
    const stacks = new Stacks()

    const contents = stacks.create('js')
    stacks.pushToTop('js', 'hello world')

    assert.equal(stacks.fillPlaceholders(contents), 'hello world')
  })

  test('push contents to the top of a stack that was already pushed to', ({ assert }) => {
    const stacks = new Stacks()

    const contents = stacks.create('js')
    stacks.pushTo('js', 'world')
    stacks.pushToTop('js', 'hello')

    assert.equal(stacks.fillPlaceholders(contents), `hello${EOL}world`)
  })

  test('push contents multiple times to stack', ({ assert }) => {
    const stacks = new Stacks()

    const contents = stacks.create('js')
    stacks.pushToTop('js', 'world')
    stacks.pushToTop('js', 'hello')

    assert.equal(stacks.fillPlaceholders(contents), `hello${EOL}world`)
  })

  test('push contents to the top before creating the stack', ({ assert }) => {
    const stacks = new Stacks()

    stacks.pushToTop('js', 'hello world')
    stacks.pushToTop('js', 'hi world')
    const contents = stacks.create('js')

    assert.equal(stacks.fillPlaceholders(contents), `hi world${EOL}hello world`)
  })
})
