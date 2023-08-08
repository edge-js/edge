/*
 * edge.js
 *
 * (c) EdgeJS
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

/**
 * This class generates a valid object as a string, which is written to the template
 * output. The reason we need a string like object, since we don't want it's
 * properties to be evaluated during the object creation, instead it must
 * be evaluated when the compiled output is invoked.
 */
export class StringifiedObject {
  #obj: string = ''

  addSpread(key: string) {
    this.#obj += this.#obj.length ? `, ${key}` : `${key}`
  }

  /**
   * Add key/value pair to the object.
   *
   * ```js
   * stringifiedObject.add('username', `'virk'`)
   * ```
   */
  add(key: any, value: any, isComputed: boolean = false) {
    key = isComputed ? `[${key}]` : key
    this.#obj += this.#obj.length ? `, ${key}: ${value}` : `${key}: ${value}`
  }

  /**
   * Returns the object alike string back.
   *
   * ```js
   * stringifiedObject.flush()
   *
   * // returns
   * `{ username: 'virk' }`
   * ```
   */
  flush(): string {
    const obj = `{ ${this.#obj} }`
    this.#obj = ''
    return obj
  }

  /**
   * Parses an array of expressions to form an object. Each expression inside the array must
   * be `ObjectExpression` or an `AssignmentExpression`, otherwise it will be ignored.
   *
   * ```js
   * (title = 'hello')
   * // returns { title: 'hello' }
   *
   * ({ title: 'hello' })
   * // returns { title: 'hello' }
   *
   * ({ title: 'hello' }, username = 'virk')
   * // returns { title: 'hello', username: 'virk' }
   * ```
   */
  static fromAcornExpressions(expressions: any[], parser: Parser): string {
    if (!Array.isArray(expressions)) {
      throw new Error('"fromAcornExpressions" expects an array of acorn ast expressions')
    }

    const objectifyString = new this()

    expressions.forEach((arg) => {
      if (arg.type === 'ObjectExpression') {
        arg.properties.forEach((prop: any) => {
          if (prop.type === 'SpreadElement') {
            objectifyString.addSpread(parser.utils.stringify(prop))
          } else {
            const key = parser.utils.stringify(prop.key)
            const value = parser.utils.stringify(prop.value)
            objectifyString.add(key, value, prop.computed)
          }
        })
      }

      if (arg.type === 'AssignmentExpression') {
        objectifyString.add(arg.left.name, parser.utils.stringify(arg.right))
      }
    })

    return objectifyString.flush()
  }
}
