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
const ArrayExpression = require('../../src/Expressions').ArrayExpression
const expressionsMixin = require('../../test-helpers/expression-mixin')

test.group('Array Expression', (group) => {
  group.beforeEach(() => {
    this.exp = new ArrayExpression(new Lexer())
  })

  expressionsMixin.bind(this)(test)

  test('parse an array of strings', (assert) => {
    const statement = `['virk', 'nikk']`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.members[0].value, 'virk')
    assert.equal(this.exp.tokens.members[1].value, 'nikk')
  })

  test('convert an array of strings', (assert) => {
    const statement = `['virk','nikk']`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), statement)
  })

  test('parse an array of numbers', (assert) => {
    const statement = `[22, 10]`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.members[0].value, 22)
    assert.equal(this.exp.tokens.members[1].value, 10)
  })

  test('convert an array of numbers', (assert) => {
    const statement = `[22,10]`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), statement)
  })

  test('parse an array of sources', (assert) => {
    const statement = `[username, age]`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.members[0].value, 'username')
    assert.equal(this.exp.tokens.members[0].type, 'source')
    assert.equal(this.exp.tokens.members[1].value, 'age')
    assert.equal(this.exp.tokens.members[1].type, 'source')
  })

  test('convert an array of sources', (assert) => {
    const statement = `[username, age]`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `[this.context.resolve('username'),this.context.resolve('age')]`)
  })
})
