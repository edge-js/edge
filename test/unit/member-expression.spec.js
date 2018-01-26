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
const MemberExpression = require('../../src/Expressions').MemberExpression
const ArrayExpression = require('../../src/Expressions').ArrayExpression
const expressionsMixin = require('../../test-helpers/expression-mixin')

test.group('Member Expression', (group) => {
  group.beforeEach(() => {
    this.exp = new MemberExpression(new Lexer())
  })

  expressionsMixin.bind(this)(test)

  test('should be able to parse a simple member expression', (assert) => {
    const statement = 'user.name'
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.parent.value, 'user')
    assert.equal(this.exp.tokens.members[0].value.value, 'name')
  })

  test('should convert simple member expression to statement', (assert) => {
    const statement = 'user.name'
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.accessChild(this.context.resolve('user'), ['name'])`)
  })

  test('should be able to parse a nested member expression', (assert) => {
    const statement = 'user.name.age'
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.parent.value, 'user')
    assert.equal(this.exp.tokens.members[0].value.value, 'name')
    assert.equal(this.exp.tokens.members[1].value.value, 'age')
  })

  test('should convert a nested member expression', (assert) => {
    const statement = 'user.name.age'
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.accessChild(this.context.resolve('user'), ['name','age'])`)
  })

  test('should be able to parse a nested member expression accessed via [] brackets', (assert) => {
    const statement = `user.profile['full-name']`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.parent.value, 'user')
    assert.equal(this.exp.tokens.members[0].value.value, 'profile')
    assert.equal(this.exp.tokens.members[1].value.value, 'full-name')
  })

  test('should convert a nested member expression accessed via [] brackets', (assert) => {
    const statement = `user.profile['full-name']`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.accessChild(this.context.resolve('user'), ['profile','full-name'])`)
  })

  test('should be able to parse native property access on Identifiers', (assert) => {
    const statement = `['virk', 'nikk'].length`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.members[0].value.value, 'length')
    assert.instanceOf(this.exp.tokens.parent, ArrayExpression)
  })

  test('should convert native property access on Identifiers', (assert) => {
    const statement = `['virk', 'nikk'].length`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.accessChild(['virk','nikk'], ['length'])`)
  })

  test('should be able to parse a literal', (assert) => {
    const statement = `'username'.length`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.parent.value, 'username')
    assert.equal(this.exp.tokens.parent.type, 'string')
    assert.equal(this.exp.tokens.members[0].value.value, 'length')
    assert.equal(this.exp.tokens.members[0].value.type, 'source')
  })

  test('should be able to parse a computed literal', (assert) => {
    const statement = `users[username]`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.accessChild(this.context.resolve('users'), [this.context.resolve('username')])`)
  })

  test('should be able to parse a computed literal with uncomputed properties', (assert) => {
    const statement = `users[username].age`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.accessChild(this.context.resolve('users'), [this.context.resolve('username'),'age'])`)
  })

  test('should be able to parse a nested computed expression', (assert) => {
    const statement = `users[username.prop]`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.accessChild(this.context.resolve('users'), [this.context.accessChild(this.context.resolve('username'), ['prop'])])`)
  })
})
