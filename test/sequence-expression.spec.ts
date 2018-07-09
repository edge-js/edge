/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import { parseSequenceExpression } from '../src/utils'
import { Parser } from 'edge-parser'
import { EdgeBuffer } from 'edge-parser/build/src/EdgeBuffer'
import { IBlockNode } from 'edge-lexer/build/src/Contracts'

const tags = {
  if: class If {
    public static block = true
    public static seekable = true
    public static selfclosed = false
    public static tagName = 'if'
    public static compile (parser: Parser, buffer: EdgeBuffer, token: IBlockNode): void {
    }
  },
}

test.group('parseSequenceExpression', () => {
  test('return name and props when using literal', (assert) => {
    const parser = new Parser(tags)
    const expression = parser.parseStatement(parser.generateAst(`('partial')`, 1).body[0])
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `'partial'`)
    assert.equal(props, `{}`)
  })

  test('return name and props when using identifier', (assert) => {
    const parser = new Parser(tags)
    const expression = parser.parseStatement(parser.generateAst(`(partial)`, 1).body[0])
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `ctx.resolve('partial')`)
    assert.equal(props, `{}`)
  })

  test('return name and props when using callable member expression', (assert) => {
    const parser = new Parser(tags)
    const expression = parser.parseStatement(parser.generateAst(`(user.partial)`, 1).body[0])
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `ctx.resolve('user').partial`)
    assert.equal(props, `{}`)
  })

  test('return name and props when using call expression', (assert) => {
    const parser = new Parser(tags)
    const expression = parser.parseStatement(parser.generateAst(`(getPartial(user))`, 1).body[0])
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `ctx.resolve('getPartial')(ctx, ctx.resolve('user'))`)
    assert.equal(props, `{}`)
  })

  test('return name and props when using sequence expression', (assert) => {
    const parser = new Parser(tags)
    const expression = parser.parseStatement(parser.generateAst(`('partial', { username: 'virk' })`, 1).body[0])
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `'partial'`)
    assert.equal(props, `{ username: 'virk' }`)
  })

  test('parse props with shorthand obj', (assert) => {
    const parser = new Parser(tags)
    const expression = parser.parseStatement(parser.generateAst(`('partial', { username })`, 1).body[0])
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `'partial'`)
    assert.equal(props, `{ username: ctx.resolve('username') }`)
  })

  test('parse props with computed obj', (assert) => {
    const parser = new Parser(tags)
    const expression = parser.parseStatement(parser.generateAst(`('partial', { [username]: username })`, 1).body[0])
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `'partial'`)
    assert.equal(props, `{ ctx.resolve('username'): ctx.resolve('username') }`)
  })

  test('parse props with multiple obj properties', (assert) => {
    const parser = new Parser(tags)
    const expression = parser.parseStatement(parser.generateAst(`('partial', { username: 'virk', age: 22 })`, 1).body[0])
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `'partial'`)
    assert.equal(props, `{ username: 'virk', age: 22 }`)
  })

  test('parse props with shorthand and full properties', (assert) => {
    const parser = new Parser(tags)
    const expression = parser.parseStatement(parser.generateAst(`('partial', { username, age: 22 })`, 1).body[0])
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `'partial'`)
    assert.equal(props, `{ username: ctx.resolve('username'), age: 22 }`)
  })

  test('parse props with assignment expression', (assert) => {
    const parser = new Parser(tags)
    const expression = parser.parseStatement(parser.generateAst(`('partial', title = 'Hello')`, 1).body[0])
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `'partial'`)
    assert.equal(props, `{ title: 'Hello' }`)
  })
})
