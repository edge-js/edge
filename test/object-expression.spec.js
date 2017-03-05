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
const ObjectExpression = require('../src/Expressions').ObjectExpression
const ArrayExpression = require('../src/Expressions').ArrayExpression
const expressionsMixin = require('../test-helpers/expression-mixin')

test.group('Object Expression', (group) => {
  group.beforeEach(() => {
    this.exp = new ObjectExpression(new Lexer())
  })

  expressionsMixin.bind(this)(test)

  test('parse simple object', (assert) => {
    const statement = `a, {name: 'virk'}`
    this.exp.parse(esprima.parse(statement).body[0].expression.expressions[1])
    assert.equal(this.exp.tokens.members[0].name.value, 'name')
    assert.equal(this.exp.tokens.members[0].name.type, 'source')
    assert.equal(this.exp.tokens.members[0].value.value, 'virk')
    assert.equal(this.exp.tokens.members[0].value.type, 'string')
  })

  test('convert simple object', (assert) => {
    const statement = `a, {name: 'virk'}`
    this.exp.parse(esprima.parse(statement).body[0].expression.expressions[1])
    assert.equal(this.exp.toStatement(), `{name: 'virk'}`)
  })

  test('parse shorthand object', (assert) => {
    const statement = `a, {name}`
    this.exp.parse(esprima.parse(statement).body[0].expression.expressions[1])
    assert.equal(this.exp.tokens.members[0].name.value, 'name')
    assert.equal(this.exp.tokens.members[0].name.type, 'source')
    assert.equal(this.exp.tokens.members[0].value.value, 'name')
    assert.equal(this.exp.tokens.members[0].value.type, 'source')
  })

  test('convert shorthand object', (assert) => {
    const statement = `a, {name}`
    this.exp.parse(esprima.parse(statement).body[0].expression.expressions[1])
    assert.equal(this.exp.toStatement(), `{name: this.resolve('name')}`)
  })

  test('parse object with numbers', (assert) => {
    const statement = `a, {age: 22}`
    this.exp.parse(esprima.parse(statement).body[0].expression.expressions[1])
    assert.equal(this.exp.tokens.members[0].name.value, 'age')
    assert.equal(this.exp.tokens.members[0].name.type, 'source')
    assert.equal(this.exp.tokens.members[0].value.value, 22)
    assert.equal(this.exp.tokens.members[0].value.type, 'number')
  })

  test('convert object with numbers', (assert) => {
    const statement = `a, {age: 22}`
    this.exp.parse(esprima.parse(statement).body[0].expression.expressions[1])
    assert.equal(this.exp.toStatement(), `{age: 22}`)
  })

  test('parse nested object', (assert) => {
    const statement = `a, {profile: { fullname: 'virk' }}`
    this.exp.parse(esprima.parse(statement).body[0].expression.expressions[1])
    assert.equal(this.exp.tokens.members[0].name.value, 'profile')
    assert.equal(this.exp.tokens.members[0].name.type, 'source')
    assert.instanceOf(this.exp.tokens.members[0].value, ObjectExpression)
  })

  test('convert nested object', (assert) => {
    const statement = `a, {profile: { fullname: 'virk' }}`
    this.exp.parse(esprima.parse(statement).body[0].expression.expressions[1])
    assert.equal(this.exp.toStatement(), `{profile: {fullname: 'virk'}}`)
  })

  test('parse object with sources on both ends', (assert) => {
    const statement = `a, { profile: profile }`
    this.exp.parse(esprima.parse(statement).body[0].expression.expressions[1])
    assert.equal(this.exp.tokens.members[0].name.value, 'profile')
    assert.equal(this.exp.tokens.members[0].name.type, 'source')
    assert.equal(this.exp.tokens.members[0].value.value, 'profile')
    assert.equal(this.exp.tokens.members[0].value.type, 'source')
  })

  test('convert object with sources on both ends', (assert) => {
    const statement = `a, { profile: profile }`
    this.exp.parse(esprima.parse(statement).body[0].expression.expressions[1])
    assert.equal(this.exp.toStatement(), `{profile: this.resolve('profile')}`)
  })

  test('parse object with arrays', (assert) => {
    const statement = `a, {users: ['virk', 'nikk']}`
    this.exp.parse(esprima.parse(statement).body[0].expression.expressions[1])
    assert.equal(this.exp.tokens.members[0].name.value, 'users')
    assert.equal(this.exp.tokens.members[0].name.type, 'source')
    assert.instanceOf(this.exp.tokens.members[0].value, ArrayExpression)
  })

  test('convert object with arrays', (assert) => {
    const statement = `a, {users: ['virk', 'nikk']}`
    this.exp.parse(esprima.parse(statement).body[0].expression.expressions[1])
    assert.equal(this.exp.toStatement(), `{users: ['virk','nikk']}`)
  })

  test('convert object with numeric keys', (assert) => {
    const statement = `a, {22: 'a'}`
    this.exp.parse(esprima.parse(statement).body[0].expression.expressions[1])
    assert.equal(this.exp.toStatement(), `{22: 'a'}`)
  })

  test('convert object with non-standard keys', (assert) => {
    const statement = `a, {'full-name': 'virk'}`
    this.exp.parse(esprima.parse(statement).body[0].expression.expressions[1])
    assert.equal(this.exp.toStatement(), `{'full-name': 'virk'}`)
  })

  test('convert object with identifier keys', (assert) => {
    const statement = `a, {[username]: 'virk'}`
    this.exp.parse(esprima.parse(statement).body[0].expression.expressions[1])
    assert.equal(this.exp.toStatement(), `{[this.resolve('username')]: 'virk'}`)
  })
})
