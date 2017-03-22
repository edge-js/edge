'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const esprima = require('esprima')
const Lexer = require('../../src/Lexer')
const ConditionalExpression = require('../../src/Expressions').ConditionalExpression
const expressionsMixin = require('../../test-helpers/expression-mixin')

test.group('Conditional Expression', (group) => {
  group.beforeEach(() => {
    this.exp = new ConditionalExpression(new Lexer())
  })

  expressionsMixin.bind(this)(test)

  test('parse simple if shorthand', (assert) => {
    const statement = `username ? username : 'anonymous'`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.test.type, 'source')
    assert.equal(this.exp.tokens.test.value, 'username')
    assert.equal(this.exp.tokens.consequent.type, 'source')
    assert.equal(this.exp.tokens.consequent.value, 'username')
    assert.equal(this.exp.tokens.alternate.type, 'string')
    assert.equal(this.exp.tokens.alternate.value, 'anonymous')
  })

  test('convert simple if shorthand', (assert) => {
    const statement = `username ? username : 'anonymous'`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.resolve('username') ? this.context.resolve('username') : 'anonymous'`)
  })

  test('convert if shorthand with logical operator', (assert) => {
    const statement = `username === 'virk' ? username : 'anonymous'`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.resolve('username') === 'virk' ? this.context.resolve('username') : 'anonymous'`)
  })

  test('convert if shorthand with nested logical operator', (assert) => {
    const statement = `username ? username : (session ? session.username : 'anonymous')`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.resolve('username') ? this.context.resolve('username') : (this.context.resolve('session') ? this.context.accessChild(this.context.resolve('session'), ['username']) : 'anonymous')`)
  })
})
