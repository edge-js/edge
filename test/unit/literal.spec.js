'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const esprima = require('esprima')
const Literal = require('../../src/Statements').Literal

test.group('Literal', () => {
  test('parse string literal', (assert) => {
    const statement = `'virk'`
    const tokens = Literal(esprima.parse(statement).body[0].expression)
    assert.equal(typeof (tokens.value) === 'string', true)
    assert.equal(typeof (tokens.value), tokens.type)
  })

  test('parse numeric literal', (assert) => {
    const statement = '22'
    const tokens = Literal(esprima.parse(statement).body[0].expression)
    assert.equal(typeof (tokens.value) === 'number', true)
    assert.equal(typeof (tokens.value), tokens.type)
  })

  test('parse null literal', (assert) => {
    const statement = 'null'
    const tokens = Literal(esprima.parse(statement).body[0].expression)
    assert.equal(typeof (tokens.value) === 'object', true)
    assert.equal(tokens.type, 'null')
  })

  test('parse undefined literal', (assert) => {
    const statement = 'undefined'
    const tokens = Literal(esprima.parse(statement).body[0].expression)
    assert.equal(typeof (tokens.value) === 'undefined', true)
    assert.equal(tokens.type, 'undefined')
  })

  test('convert string literal to statement', (assert) => {
    const statement = `'virk'`
    const tokens = Literal(esprima.parse(statement).body[0].expression)
    assert.equal(tokens.toStatement(), `'virk'`)
  })

  test('convert numeric literal to statement', (assert) => {
    const statement = `22`
    const tokens = Literal(esprima.parse(statement).body[0].expression)
    assert.equal(tokens.toStatement(), 22)
  })

  test('convert null literal to statement', (assert) => {
    const statement = `null`
    const tokens = Literal(esprima.parse(statement).body[0].expression)
    assert.isNull(tokens.toStatement())
  })

  test('convert undefined literal to statement', (assert) => {
    const statement = `undefined`
    const tokens = Literal(esprima.parse(statement).body[0].expression)
    assert.isUndefined(tokens.toStatement())
  })
})
