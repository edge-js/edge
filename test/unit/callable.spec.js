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
const CallExpression = require('../../src/Expressions').CallExpression
const MemberExpression = require('../../src/Expressions').MemberExpression
const expressionsMixin = require('../../test-helpers/expression-mixin')

test.group('Call Expression', (group) => {
  group.beforeEach(() => {
    this.exp = new CallExpression(new Lexer())
  })

  expressionsMixin.bind(this)(test)

  test('parse a simple function', (assert) => {
    const statement = `count(users)`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.callee.value, 'count')
    assert.equal(this.exp.tokens.callee.type, 'source')
    assert.equal(this.exp.tokens.args[0].value, 'users')
    assert.equal(this.exp.tokens.args[0].type, 'source')
  })

  test('parse a function with multiple params', (assert) => {
    const statement = `count(users, 22)`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.callee.value, 'count')
    assert.equal(this.exp.tokens.callee.type, 'source')
    assert.equal(this.exp.tokens.args[0].value, 'users')
    assert.equal(this.exp.tokens.args[0].type, 'source')
    assert.equal(this.exp.tokens.args[1].value, 22)
    assert.equal(this.exp.tokens.args[1].type, 'number')
  })

  test('convert a function to statement', (assert) => {
    const statement = `count(users)`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.callFn('count', [this.context.resolve('users')])`)
  })

  test('convert a function with multiple arguments to statement', (assert) => {
    const statement = `count(users, true)`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.callFn('count', [this.context.resolve('users'),true])`)
  })

  test('convert a function to statement with array expression', (assert) => {
    const statement = `count([{username: 'virk'}])`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.callFn('count', [[{username: 'virk'}]])`)
  })

  test('parse a nested function call', (assert) => {
    const statement = `filter(count(users))`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.callee.value, 'filter')
    assert.equal(this.exp.tokens.callee.type, 'source')
    assert.instanceOf(this.exp.tokens.args[0], CallExpression)
  })

  test('convert a nested function call to statement', (assert) => {
    const statement = `filter(count(users))`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.callFn('filter', [this.context.callFn('count', [this.context.resolve('users')])])`)
  })

  test('parse a function called on an expression', (assert) => {
    const statement = `users.indexOf('virk')`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.instanceOf(this.exp.tokens.callee, MemberExpression)
    assert.equal(this.exp.tokens.args[0].type, 'string')
    assert.equal(this.exp.tokens.args[0].value, 'virk')
  })

  test('convert a function called on an expression to statement', (assert) => {
    const statement = `users.indexOf(['virk'])`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.resolve('users').indexOf(['virk'])`)
  })

  test('convert a function called on child member to statement', (assert) => {
    const statement = `users.list.indexOf('virk')`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.accessChild(this.context.resolve('users'), ['list']).indexOf('virk')`)
  })

  test('convert a function called on an identifier', (assert) => {
    const statement = `users.indexOf(username)`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.resolve('users').indexOf(this.context.resolve('username'))`)
  })

  test('convert nested calls to statement', (assert) => {
    const statement = `users.indexOf(username.toLowerCase())`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.resolve('users').indexOf(this.context.resolve('username').toLowerCase())`)
  })

  test('convert calls on array to statement', (assert) => {
    const statement = `['virk', 'foo'].indexOf('virk')`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `['virk','foo'].indexOf('virk')`)
  })

  test('convert calls on string to statement', (assert) => {
    const statement = `'virk'.includes('v')`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `'virk'.includes('v')`)
  })

  test('convert calls on nested properties to statement', (assert) => {
    const statement = `user.username.includes('a')`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toStatement(), `this.context.accessChild(this.context.resolve('user'), ['username']).includes('a')`)
  })
})
