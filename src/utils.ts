/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EdgeError } from 'edge-error'
import type { TagToken } from 'edge-lexer/types'
import { expressions as expressionsList, Parser } from 'edge-parser'

type ExpressionList = readonly (keyof typeof expressionsList)[]

/**
 * Raise an `E_UNALLOWED_EXPRESSION` exception. Filename and expression is
 * required to point the error stack to the correct file
 */
export function unallowedExpression(
  message: string,
  filename: string,
  loc: { line: number; col: number }
) {
  throw new EdgeError(message, 'E_UNALLOWED_EXPRESSION', {
    line: loc.line,
    col: loc.col,
    filename: filename,
  })
}

/**
 * Validates the expression type to be part of the allowed
 * expressions only.
 *
 * The filename is required to report errors.
 *
 * ```js
 * isNotSubsetOf(expression, ['Literal', 'Identifier'], () => {})
 * ```
 */
export function isSubsetOf(
  expression: any,
  expressions: ExpressionList,
  errorCallback: () => void
) {
  if (!expressions.includes(expression.type)) {
    errorCallback()
  }
}

/**
 * Validates the expression type not to be part of the disallowed
 * expressions.
 *
 * The filename is required to report errors.
 *
 * ```js
 * isNotSubsetOf(expression, 'SequenceExpression', () => {})
 * ```
 */
export function isNotSubsetOf(
  expression: any,
  expressions: ExpressionList,
  errorCallback: () => void
) {
  if (expressions.includes(expression.type)) {
    errorCallback()
  }
}

/**
 * Parses the jsArg by generating and transforming its AST
 */
export function parseJsArg(parser: Parser, token: TagToken) {
  return parser.utils.transformAst(
    parser.utils.generateAST(token.properties.jsArg, token.loc, token.filename),
    token.filename,
    parser
  )
}

/**
 * Each loop. A soft replacement for `lodash.each` that we were using earlier
 */
export function each(collection: any, iteratee: (value: any, key: any) => void) {
  if (Array.isArray(collection)) {
    for (let [key, value] of collection.entries()) {
      iteratee(value, key)
    }
    return
  }

  if (typeof collection === 'string') {
    let index = 0
    for (let value of collection) {
      iteratee(value, index++)
    }
    return
  }

  if (collection && typeof collection === 'object') {
    for (let [key, value] of Object.entries(collection)) {
      iteratee(value, key)
    }
  }
}

/**
 * Async each loop. A soft replacement for `lodash.each` that we were
 * using earlier with support for async await
 */
export async function asyncEach(
  collection: any,
  iteratee: (value: any, key: any) => Promise<void>
) {
  if (Array.isArray(collection)) {
    for (let [key, value] of collection.entries()) {
      await iteratee(value, key)
    }
    return
  }

  if (typeof collection === 'string') {
    let index = 0
    for (let value of collection) {
      await iteratee(value, index++)
    }
    return
  }

  if (collection && typeof collection === 'object') {
    for (let [key, value] of Object.entries(collection)) {
      await iteratee(value, key)
    }
  }
}
