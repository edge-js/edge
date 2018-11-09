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

const tags = {
  if: class If {
    public static block = true
    public static seekable = true
    public static selfclosed = false
    public static tagName = 'if'
    public static compile (): void {
    }
  },
}

const loc = {
  start: {
    line: 1,
    col: 0,
  },
  end: {
    line: 1,
    col: 0,
  },
}

test.group('parseSequenceExpression', () => {
  test('return name and props when using literal', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })
    const expression = parser.acornToEdgeExpression(parser.generateAst(`('partial')`, loc).body[0])
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `'partial'`)
    assert.equal(props, `{}`)
  })

  test('return name and props when using identifier', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })
    const expression = parser.acornToEdgeExpression(parser.generateAst(`(partial)`, loc).body[0])
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `ctx.resolve('partial')`)
    assert.equal(props, `{}`)
  })

  test('return name and props when using callable member expression', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })
    const expression = parser.acornToEdgeExpression(parser.generateAst(`(user.partial)`, loc).body[0])
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `ctx.resolve('user').partial`)
    assert.equal(props, `{}`)
  })

  test('return name and props when using call expression', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })
    const expression = parser.acornToEdgeExpression(parser.generateAst(`(getPartial(user))`, loc).body[0])
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `ctx.resolve('getPartial')(ctx, ctx.resolve('user'))`)
    assert.equal(props, `{}`)
  })

  test('return name and props when using sequence expression', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })
    const expression = parser.acornToEdgeExpression(
      parser.generateAst(`('partial', { username: 'virk' })`, loc).body[0],
    )
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `'partial'`)
    assert.equal(props, `{ username: 'virk' }`)
  })

  test('parse props with shorthand obj', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })
    const expression = parser.acornToEdgeExpression(parser.generateAst(`('partial', { username })`, loc).body[0])
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `'partial'`)
    assert.equal(props, `{ username: ctx.resolve('username') }`)
  })

  test('parse props with computed obj', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })
    const expression = parser.acornToEdgeExpression(
      parser.generateAst(`('partial', { [username]: username })`, loc).body[0],
    )
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `'partial'`)
    assert.equal(props, `{ ctx.resolve('username'): ctx.resolve('username') }`)
  })

  test('parse props with multiple obj properties', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })
    const ast = parser.generateAst(`('partial', { username: 'virk', age: 22 })`, loc).body[0]
    const expression = parser.acornToEdgeExpression(ast)
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `'partial'`)
    assert.equal(props, `{ username: 'virk', age: 22 }`)
  })

  test('parse props with shorthand and full properties', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })
    const expression = parser.acornToEdgeExpression(
      parser.generateAst(`('partial', { username, age: 22 })`, loc).body[0],
    )
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `'partial'`)
    assert.equal(props, `{ username: ctx.resolve('username'), age: 22 }`)
  })

  test('parse props with assignment expression', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })
    const expression = parser.acornToEdgeExpression(parser.generateAst(`('partial', title = 'Hello')`, loc).body[0])
    const [name, props] = parseSequenceExpression(expression, parser)
    assert.equal(name, `'partial'`)
    assert.equal(props, `{ title: 'Hello' }`)
  })
})
