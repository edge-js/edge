/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as dedent from 'dedent'
import * as test from 'japa'
import { Parser } from 'edge-parser'
import {
  expressionsToStringifyObject,
  extractDiskAndTemplateName,
  isBlockToken,
  getLineAndColumnForToken,
} from '../src/utils'

const tags = {
  if: {
    block: true,
    seekable: true,
    compile () {},
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

test.group('expressionsToStringifyObject', () => {
  test('stringify object expression', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })
    const expression = parser.acornToEdgeExpression(
      parser.generateAcornExpression(`({ username: 'virk' })`, loc),
    )

    const props = expressionsToStringifyObject([expression], parser)
    assert.equal(props, `{ username: 'virk' }`)
  })

  test('parse props with shorthand obj', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })
    const expression = parser.acornToEdgeExpression(
      parser.generateAcornExpression(`({ username })`, loc),
    )

    const props = expressionsToStringifyObject([expression], parser)
    assert.equal(props, `{ username: ctx.resolve('username') }`)
  })

  test('parse props with computed obj', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })
    const expression = parser.acornToEdgeExpression(
      parser.generateAcornExpression(`({ [username]: username })`, loc),
    )

    const props = expressionsToStringifyObject([expression], parser)
    assert.equal(props, `{ ctx.resolve('username'): ctx.resolve('username') }`)
  })

  test('parse props with multiple obj properties', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })
    const expression = parser.acornToEdgeExpression(
      parser.generateAcornExpression(`({ username: 'virk', age: 22 })`, loc),
    )

    const props = expressionsToStringifyObject([expression], parser)

    assert.equal(props, `{ username: 'virk', age: 22 }`)
  })

  test('parse props with shorthand and full properties', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })
    const expression = parser.acornToEdgeExpression(
      parser.generateAcornExpression(`({ username, age: 22 })`, loc),
    )

    const props = expressionsToStringifyObject([expression], parser)
    assert.equal(props, `{ username: ctx.resolve('username'), age: 22 }`)
  })

  test('parse props with assignment expression', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })
    const expression = parser.acornToEdgeExpression(
      parser.generateAcornExpression(`(title = 'Hello')`, loc),
    )

    const props = expressionsToStringifyObject([expression], parser)
    assert.equal(props, `{ title: 'Hello' }`)
  })

  test('parse props with more than one assignment expression', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })
    const expression = parser.acornToEdgeExpression(
      parser.generateAcornExpression(`(title = 'Hello', body = 'Some content')`, loc),
    )

    const props = expressionsToStringifyObject(expression.expressions, parser)
    assert.equal(props, `{ title: 'Hello', body: 'Some content' }`)
  })
})

test.group('extractDiskAndTemplateName', () => {
  test('return disk as default when explicit name is not defined', (assert) => {
    assert.deepEqual(extractDiskAndTemplateName('foo'), ['default', 'foo.edge'])
  })

  test('return disk name explicit name is defined', (assert) => {
    assert.deepEqual(extractDiskAndTemplateName('admin::foo'), ['admin', 'foo.edge'])
  })

  test('ignore all double colons (::) after first one', (assert) => {
    assert.deepEqual(extractDiskAndTemplateName('admin::foo::bar'), ['admin', 'foo::bar.edge'])
  })
})

test.group('isBlockToken', () => {
  test('return true if token is block level matching token', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })

    const tokens = parser.generateLexerTokens(dedent`@if()
      @endif
    `)

    assert.isTrue(isBlockToken(tokens[0], 'if'))
    assert.isFalse(isBlockToken(tokens[0], 'elseif'))
  })

  test('return false if token is not block level matching token', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })

    const tokens = parser.generateLexerTokens(dedent`{{ username }}`)
    assert.isFalse(isBlockToken(tokens[0], 'if'))
  })
})

test.group('getLineAndColumnForToken', () => {
  test('return line no for different style of tokens', (assert) => {
    const parser = new Parser(tags, { filename: 'foo.edge' })

    const tokens = parser.generateLexerTokens(dedent`
      Hello world

      {{ username }}

      @if(username)
        {{ username }}
      @endif
    `)

    assert.deepEqual(getLineAndColumnForToken(tokens[0]), [1, 0])
    assert.deepEqual(getLineAndColumnForToken(tokens[2]), [2, 0])
    assert.deepEqual(getLineAndColumnForToken(tokens[4]), [3, 2])
    assert.deepEqual(getLineAndColumnForToken(tokens[8]), [5, 4])
  })
})
