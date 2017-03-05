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
const Lexer = require('../src/Lexer')
const BinaryExpression = require('../src/Expressions').BinaryExpression
const expressionsMixin = require('../test-helpers/expression-mixin')

test.group('BinaryExpression Expression', (group) => {
  group.beforeEach(() => {
    this.exp = new BinaryExpression(new Lexer())
  })

  expressionsMixin.bind(this)(test)

  test('parse a simple binary expression', (assert) => {
    const statement = `username === 'virk'`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.operator, '===')
    assert.equal(this.exp.tokens.lhs.value, 'username')
    assert.equal(this.exp.tokens.lhs.type, 'source')
    assert.equal(this.exp.tokens.rhs.value, 'virk')
    assert.equal(this.exp.tokens.rhs.type, 'string')
  })

  test('convert a simple binary expression', (assert) => {
    const statement = `username === 'virk'`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.resolve('username') === 'virk'`)
  })

  test('parse with sources on both ends', (assert) => {
    const statement = `username === oldUsername`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.lhs.value, 'username')
    assert.equal(this.exp.tokens.lhs.type, 'source')
    assert.equal(this.exp.tokens.rhs.value, 'oldUsername')
    assert.equal(this.exp.tokens.rhs.type, 'source')
  })

  test('convert with sources on both ends', (assert) => {
    const statement = `username === oldUsername`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.resolve('username') === this.resolve('oldUsername')`)
  })

  test('parse with member expression', (assert) => {
    const statement = `user.username === 'virk'`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.lhs.tokens.parent.value, 'user')
    assert.equal(this.exp.tokens.lhs.tokens.parent.type, 'source')
  })

  test('convert with member expression', (assert) => {
    const statement = `user.username === 'virk'`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.accessChild(this.resolve('user'), ['username']) === 'virk'`)
  })

  test('parse nested binary expression', (assert) => {
    const statement = `2 + 2 === 4`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.lhs.tokens.lhs.value, 2)
    assert.equal(this.exp.tokens.lhs.tokens.rhs.value, 2)
    assert.equal(this.exp.tokens.lhs.tokens.operator, '+')
  })

  test('convert nested binary expression', (assert) => {
    const statement = `2 + 2 === 4`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), '2 + 2 === 4')
  })

  test('convert nested wrapped binary expression', (assert) => {
    const statement = `(2 + 2) * 4`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), '(2 + 2) * 4')
  })

  test('convert deeply nested wrapped binary expression', (assert) => {
    const statement = `((2 * 3) + 2) * 4`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), '((2 * 3) + 2) * 4')
  })
})
