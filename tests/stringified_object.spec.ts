/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Parser, Stack } from 'edge-parser'
import { StringifiedObject } from '../src/utils.js'

/**
 * Sample loc
 */
const LOC = {
  start: {
    line: 1,
    col: 0,
  },
  end: {
    line: 1,
    col: 0,
  },
}

test.group('StringifiedObject', () => {
  test('add string as a key-value pair to object', ({ assert }) => {
    const stringified = new StringifiedObject()
    stringified.add('username', "'virk'")
    assert.equal(stringified.flush(), "{ username: 'virk' }")
  })

  test('add number as a key-value pair to object', ({ assert }) => {
    const stringified = new StringifiedObject()
    stringified.add('username', '22')
    assert.equal(stringified.flush(), '{ username: 22 }')
  })

  test('add boolean as a key-value pair to object', ({ assert }) => {
    const stringified = new StringifiedObject()
    stringified.add('username', 'true')
    assert.equal(stringified.flush(), '{ username: true }')
  })

  test('add object as a key-value pair to object', ({ assert }) => {
    const stringified = new StringifiedObject()
    stringified.add('username', '{ age: 22 }')
    assert.equal(stringified.flush(), '{ username: { age: 22 } }')
  })

  test('add array as a key-value pair to object', ({ assert }) => {
    const stringified = new StringifiedObject()
    stringified.add('username', '[10, 20]')
    assert.equal(stringified.flush(), '{ username: [10, 20] }')
  })
})

test.group('StringifiedObject | fromAcornAst', () => {
  test('stringify object expression', ({ assert }) => {
    const parser = new Parser({}, new Stack(), {
      async: false,
      statePropertyName: 'state',
      escapeCallPath: 'escape',
      toAttributesCallPath: 'toAttributes',
    })
    const expression = parser.utils.transformAst(
      parser.utils.generateAST("({ username: 'virk' })", LOC, 'eval.edge'),
      'eval.edge',
      parser
    )

    const props = StringifiedObject.fromAcornExpressions([expression], parser)
    assert.equal(props, "{ username: 'virk' }")
  })

  test('parse props with shorthand obj', ({ assert }) => {
    const parser = new Parser({}, new Stack(), {
      async: false,
      statePropertyName: 'state',
      escapeCallPath: 'escape',
      toAttributesCallPath: 'toAttributes',
    })
    const expression = parser.utils.transformAst(
      parser.utils.generateAST('({ username })', LOC, 'eval.edge'),
      'eval.edge',
      parser
    )

    const props = StringifiedObject.fromAcornExpressions([expression], parser)
    assert.equal(props, '{ username: state.username }')
  })

  test('parse props with computed obj', ({ assert }) => {
    const parser = new Parser({}, new Stack(), {
      async: false,
      statePropertyName: 'state',
      escapeCallPath: 'escape',
      toAttributesCallPath: 'toAttributes',
    })
    const expression = parser.utils.transformAst(
      parser.utils.generateAST('({ [username]: username })', LOC, 'eval.edge'),
      'eval.edge',
      parser
    )

    const props = StringifiedObject.fromAcornExpressions([expression], parser)
    assert.equal(props, '{ [state.username]: state.username }')
  })

  test('parse props with multiple obj properties', ({ assert }) => {
    const parser = new Parser({}, new Stack(), {
      async: false,
      statePropertyName: 'state',
      escapeCallPath: 'escape',
      toAttributesCallPath: 'toAttributes',
    })
    const expression = parser.utils.transformAst(
      parser.utils.generateAST("({ username: 'virk', age: 22 })", LOC, 'eval.edge'),
      'eval.edge',
      parser
    )

    const props = StringifiedObject.fromAcornExpressions([expression], parser)

    assert.equal(props, "{ username: 'virk', age: 22 }")
  })

  test('parse props with shorthand and full properties', ({ assert }) => {
    const parser = new Parser({}, new Stack(), {
      async: false,
      statePropertyName: 'state',
      escapeCallPath: 'escape',
      toAttributesCallPath: 'toAttributes',
    })
    const expression = parser.utils.transformAst(
      parser.utils.generateAST('({ username, age: 22 })', LOC, 'eval.edge'),
      'eval.edge',
      parser
    )

    const props = StringifiedObject.fromAcornExpressions([expression], parser)
    assert.equal(props, '{ username: state.username, age: 22 }')
  })

  test('parse props with assignment expression', ({ assert }) => {
    const parser = new Parser({}, new Stack(), {
      async: false,
      statePropertyName: 'state',
      escapeCallPath: 'escape',
      toAttributesCallPath: 'toAttributes',
    })
    const expression = parser.utils.transformAst(
      parser.utils.generateAST("(title = 'Hello')", LOC, 'eval.edge'),
      'eval.edge',
      parser
    )

    const props = StringifiedObject.fromAcornExpressions([expression], parser)
    assert.equal(props, "{ title: 'Hello' }")
  })

  test('parse props with more than one assignment expression', ({ assert }) => {
    const parser = new Parser({}, new Stack(), {
      async: false,
      statePropertyName: 'state',
      escapeCallPath: 'escape',
      toAttributesCallPath: 'toAttributes',
    })
    const expression = parser.utils.transformAst(
      parser.utils.generateAST("(title = 'Hello', body = 'Some content')", LOC, 'eval.edge'),
      'eval.edge',
      parser
    )

    const props = StringifiedObject.fromAcornExpressions(expression.expressions, parser)
    assert.equal(props, "{ title: 'Hello', body: 'Some content' }")
  })
})
