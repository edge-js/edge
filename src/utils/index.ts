/**
 * @module edge
 */

/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { sep } from 'path'
import { EdgeError } from 'edge-error'
import { Token, TagTypes, TagToken } from 'edge-lexer'
import { Parser, expressions as expressionsList } from 'edge-parser'
import { StringifiedObject } from '../StringifiedObject'

/**
 * Validates the expression type to be part of the allowed
 * expressions only.
 *
 * The filename is required to report errors.
 *
 * ```js
 * allowExpressions('include', 'SequenceExpression', ['Literal', 'Identifier'], 'foo.edge')
 * ```
 */
export function allowExpressions (
  expression: any,
  expressions: (keyof typeof expressionsList)[],
  filename: string,
  message: string,
) {
  if (!expressions.includes(expression.type)) {
    throw new EdgeError(message, 'E_UNALLOWED_EXPRESSION', {
      line: expression.loc.start.line,
      col: expression.loc.start.column,
      filename: filename,
    })
  }
}

/**
 * Validates the expression type not to be part of the disallowed
 * expressions.
 *
 * The filename is required to report errors.
 *
 * ```js
 * disAllowExpressions('include', 'SequenceExpression', ['Literal', 'Identifier'], 'foo.edge')
 * ```
 */
export function disAllowExpressions (
  expression: any,
  expressions: (keyof typeof expressionsList)[],
  filename: string,
  message: string,
) {
  if (expressions.includes(expression.type)) {
    throw new EdgeError(message, 'E_UNALLOWED_EXPRESSION', {
      line: expression.loc.start.line,
      col: expression.loc.start.column,
      filename: filename,
    })
  }
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
export function expressionsToStringifyObject (expressions: any[], parser: Parser): string {
  const objectifyString = new StringifiedObject()

  expressions.forEach((arg) => {
    if (arg.type === 'ObjectExpression') {
      arg.properties.forEach((prop) => {
        const key = parser.stringifyExpression(prop.key)
        const value = parser.stringifyExpression(prop.value)
        objectifyString.add(key, value)
      })
    }

    if (arg.type === 'AssignmentExpression') {
      objectifyString.add(arg.left.name, parser.stringifyExpression(arg.right))
    }
  })

  return objectifyString.flush()
}

/**
 * Extracts the disk name and the template name from the template
 * path expression.
 *
 * If `diskName` is missing, it will be set to `default`.
 *
 * ```
 * extractDiskAndTemplateName('users::list')
 * // returns ['users', 'list.edge']
 *
 * extractDiskAndTemplateName('list')
 * // returns ['default', 'list.edge']
 * ```
 */
export function extractDiskAndTemplateName (templatePath: string): [string, string] {
  let [disk, ...rest] = templatePath.split('::')

  if (!rest.length) {
    rest = [disk]
    disk = 'default'
  }

  const [template, ext] = rest.join('::').split('.edge')
  return [disk, `${template.replace(/\./, sep)}.${ext || 'edge'}`]
}

/**
 * Returns a boolean, telling whether the lexer node is a block node
 * or not.
 */
export function isBlockToken (token: Token, name: string): token is TagToken {
  if (token.type === TagTypes.TAG || token.type === TagTypes.ETAG) {
    return token.properties.name === name
  }

  return false
}

/**
 * Returns line and number for a given AST token
 */
export function getLineAndColumnForToken (token: Token): [number, number] {
  if (token.type === 'newline' || token.type === 'raw') {
    return [token.line, 0]
  }

  return [token.loc.start.line, token.loc.start.col]
}
