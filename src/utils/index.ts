/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { EdgeError } from 'edge-error'
import { expressions as expressionsList } from 'edge-parser'

type ExpressionList = readonly (keyof typeof expressionsList)[]

/**
 * Raise an `E_UNALLOWED_EXPRESSION` exception. Filename and expression is
 * required to point the error stack to the correct file
 */
export function unallowedExpression (message: string, expression: any, filename: string) {
  throw new EdgeError(message, 'E_UNALLOWED_EXPRESSION', {
    line: expression.loc.start.line,
    col: expression.loc.start.column,
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
export function isSubsetOf (expression: any, expressions: ExpressionList, errorCallback: () => void) {
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
export function isNotSubsetOf (expression: any, expressions: ExpressionList, errorCallback: () => void) {
  if (expressions.includes(expression.type)) {
    errorCallback()
  }
}
