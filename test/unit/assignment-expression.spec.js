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
const AssignmentExpression = require('../../src/Expressions').AssignmentExpression
const expressionsMixin = require('../../test-helpers/expression-mixin')

test.group('Assignment Expression', (group) => {
  group.beforeEach(() => {
    this.exp = new AssignmentExpression(new Lexer())
  })

  expressionsMixin.bind(this)(test)

  test('parse assignment', (assert) => {
    const statement = 'age = 20'
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.operator, '=')
    assert.equal(this.exp.tokens.lhs.type, 'source')
    assert.equal(this.exp.tokens.rhs.type, 'number')
    assert.equal(this.exp.tokens.lhs.value, 'age')
    assert.equal(this.exp.tokens.rhs.value, 20)
  })

  test('parse assignment with array', (assert) => {
    const statement = `users = ['virk', 'nikk']`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.tokens.operator, '=')
    assert.equal(this.exp.tokens.lhs.type, 'source')
    assert.equal(this.exp.tokens.lhs.value, 'users')
    assert.equal(this.exp.tokens.rhs.type, 'array')
  })

  test('convert assignment to object', (assert) => {
    const statement = `users = ['virk', 'nikk']`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toObject(), `{users: ['virk','nikk']}`)
  })

  test('convert assignment to object that has identifiers', (assert) => {
    const statement = `users = [oldUsers]`
    this.exp.parse(esprima.parse(statement).body[0].expression)
    assert.equal(this.exp.toObject(), `{users: [this.context.resolve('oldUsers')]}`)
  })
})
