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
const LogicalExpression = require('../../src/Expressions').LogicalExpression
const expressionsMixin = require('../../test-helpers/expression-mixin')

test.group('Logical Expression', (group) => {
  group.beforeEach(() => {
    this.exp = new LogicalExpression(new Lexer())
  })

  expressionsMixin.bind(this)(test)

  test('parse simple logical expression', (assert) => {
    const statement = `username || 'virk'`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.operator, '||')
    assert.equal(this.exp.tokens.lhs.value, 'username')
    assert.equal(this.exp.tokens.lhs.type, 'source')
    assert.equal(this.exp.tokens.rhs.value, 'virk')
    assert.equal(this.exp.tokens.rhs.type, 'string')
  })

  test('convert simple logical expression to statement', (assert) => {
    const statement = `username || 'virk'`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.resolve('username') || 'virk'`)
  })

  test('parse logical expression with sources on both ends', (assert) => {
    const statement = `username || oldUsername`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.operator, '||')
    assert.equal(this.exp.tokens.lhs.value, 'username')
    assert.equal(this.exp.tokens.lhs.type, 'source')
    assert.equal(this.exp.tokens.rhs.value, 'oldUsername')
    assert.equal(this.exp.tokens.rhs.type, 'source')
  })

  test('convert logical expression with sources on both ends to statement', (assert) => {
    const statement = `username || oldUsername`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.resolve('username') || this.context.resolve('oldUsername')`)
  })

  test('parse nested logical expression', (assert) => {
    const statement = `username || oldUsername || 'virk'`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.operator, '||')
    assert.instanceOf(this.exp.tokens.lhs, LogicalExpression)
    assert.equal(this.exp.tokens.rhs.value, 'virk')
    assert.equal(this.exp.tokens.rhs.type, 'string')
  })

  test('convert nested logical expression to statement', (assert) => {
    const statement = `username || oldUsername || 'virk'`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `(this.context.resolve('username') || this.context.resolve('oldUsername')) || 'virk'`)
  })

  test('parse nested logical expression wrapped with ()', (assert) => {
    const statement = `username || (oldUsername || 'virk')`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.operator, '||')
    assert.equal(this.exp.tokens.lhs.value, 'username')
    assert.equal(this.exp.tokens.lhs.type, 'source')
    assert.instanceOf(this.exp.tokens.rhs, LogicalExpression)
  })

  test('convert nested logical expression wrapped with () to statement', (assert) => {
    const statement = `username || (oldUsername || 'virk')`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.resolve('username') || (this.context.resolve('oldUsername') || 'virk')`)
  })

  test('convert deeply nested logical expression wrapped with () to statement', (assert) => {
    const statement = `(username || oldUsername) && (age || oldAge)`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `(this.context.resolve('username') || this.context.resolve('oldUsername')) && (this.context.resolve('age') || this.context.resolve('oldAge'))`)
  })
})
