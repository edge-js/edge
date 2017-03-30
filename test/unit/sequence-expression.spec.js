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
const Lexer = require('../../src/Lexer')
const SequenceExpression = require('../../src/Expressions').SequenceExpression
const ObjectExpression = require('../../src/Expressions').ObjectExpression
const AssignmentExpression = require('../../src/Expressions').AssignmentExpression
const expressionsMixin = require('../../test-helpers/expression-mixin')

test.group('Sequence Expression', (group) => {
  group.beforeEach(() => {
    this.exp = new SequenceExpression(new Lexer())
  })

  expressionsMixin.bind(this)(test)

  test('parse sequence expression', (assert) => {
    const statement = `'message', message`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.members[0].value, 'message')
    assert.equal(this.exp.tokens.members[0].type, 'string')
    assert.equal(this.exp.tokens.members[1].value, 'message')
    assert.equal(this.exp.tokens.members[1].type, 'source')
  })

  test('parse sequence expression with object expression', (assert) => {
    const statement = `'message', { message: message }`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.members[0].value, 'message')
    assert.equal(this.exp.tokens.members[0].type, 'string')
    assert.instanceOf(this.exp.tokens.members[1], ObjectExpression)
  })

  test('parse sequence expression with object expression shorthand', (assert) => {
    const statement = `'message', { message }`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.members[0].value, 'message')
    assert.equal(this.exp.tokens.members[0].type, 'string')
    assert.instanceOf(this.exp.tokens.members[1], ObjectExpression)
  })

  test('parse sequence expression with assignment expression', (assert) => {
    const statement = `'message', age = 20`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.members[0].value, 'message')
    assert.equal(this.exp.tokens.members[0].type, 'string')
    assert.instanceOf(this.exp.tokens.members[1], AssignmentExpression)
  })

  test('convert sequence to object', (assert) => {
    const statement = `'message', { message }`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.deepEqual(this.exp.toObject(), [`'message'`, [{key: 'message', value: `this.context.resolve('message')`}]])
  })

  test('convert sequence to statement', (assert) => {
    const statement = `'message', { message }`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.deepEqual(this.exp.toStatement(), [`'message'`, `{message: this.context.resolve('message')}`])
  })

  test('convert sequence to object with assignment', (assert) => {
    const statement = `'message', age = 20`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.deepEqual(this.exp.toObject(), [`'message'`, {key: 'age', value: 20}])
  })

  test('convert sequence to statement with assignment', (assert) => {
    const statement = `'message', age = 20`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.deepEqual(this.exp.toStatement(), [`'message'`, `{age: 20}`])
  })

  test('convert sequence to object with source as assignment', (assert) => {
    const statement = `'message', age = userAge`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.deepEqual(this.exp.toObject(), [`'message'`, {key: 'age', value: `this.context.resolve('userAge')`}])
  })

  test('convert sequence to statement with source as assignment', (assert) => {
    const statement = `'message', age = userAge`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.deepEqual(this.exp.toStatement(), [`'message'`, `{age: this.context.resolve('userAge')}`])
  })
})
