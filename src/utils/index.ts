/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { UnAllowedExpressionException } from '../Exceptions'

export function allowExpressions (tag: string, expression: any, expressions: string[]) {
  if (expressions.indexOf(expression.type) === -1) {
    throw UnAllowedExpressionException.invoke('if', expression.type, expression.loc.start.line)
  }
}

export function disAllowExpressions (tag: string, expression: any, expressions: string[]) {
  if (expressions.indexOf(expression.type) > -1) {
    throw UnAllowedExpressionException.invoke('if', expression.type, expression.loc.start.line)
  }
}
