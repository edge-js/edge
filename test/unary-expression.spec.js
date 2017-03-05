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
const UnaryExpression = require('../src/Expressions').UnaryExpression
const MemberExpression = require('../src/Expressions').MemberExpression
const expressionsMixin = require('../test-helpers/expression-mixin')

test.group('Sequence Expression', (group) => {
  group.beforeEach(() => {
    this.exp = new UnaryExpression(new Lexer())
  })

  expressionsMixin.bind(this)(test)

  test('parse simple unary expression', (assert) => {
    const statement = `!username`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.operator, '!')
    assert.equal(this.exp.tokens.arg.type, 'source')
    assert.equal(this.exp.tokens.arg.value, 'username')
  })

  test('convert simple unary expression to statement', (assert) => {
    const statement = `!username`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `!this.resolve('username')`)
  })

  test('parse unary expression on literal', (assert) => {
    const statement = `!'virk'`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.operator, '!')
    assert.equal(this.exp.tokens.arg.type, 'string')
    assert.equal(this.exp.tokens.arg.value, 'virk')
  })

  test('convert unary expression on literal to statement', (assert) => {
    const statement = `!'virk'`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `!'virk'`)
  })

  test('parse unary expression on object', (assert) => {
    const statement = `!user.username`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.operator, '!')
    assert.instanceOf(this.exp.tokens.arg, MemberExpression)
  })

  test('convert unary expression on object to statement', (assert) => {
    const statement = `!user.username`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `!this.accessChild(this.resolve('user'), ['username'])`)
  })
})
