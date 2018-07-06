/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { UnAllowedExpressionException } from '../Exceptions'
import { Parser } from 'edge-parser'
import { sep } from 'path'

export class ObjectifyString {
  private obj: string = ''

  /**
   * Add key/value pair to the object
   */
  public add (key: any, value: any) {
    this.obj += this.obj.length ? `, ${key}: ${value}` : `${key}: ${value}`
  }

  /**
   * Returns the object alike string back
   */
  public flush (): string {
    const obj = this.obj
    this.obj = ''

    return `{ ${obj} }`
  }
}

/**
 * Validates the expression type to be part of the allowed
 * expressions only
 */
export function allowExpressions (tag: string, expression: any, expressions: string[]) {
  if (expressions.indexOf(expression.type) === -1) {
    throw UnAllowedExpressionException.invoke('if', expression.type, expression.loc.start.line)
  }
}

/**
 * Validates the expression type to not be part of the black
 * listed expressions.
 */
export function disAllowExpressions (tag: string, expression: any, expressions: string[]) {
  if (expressions.indexOf(expression.type) > -1) {
    throw UnAllowedExpressionException.invoke('if', expression.type, expression.loc.start.line)
  }
}

/**
 * Parses the sequence expression to an array of with first value as a string and
 * other value as a string representation of the object.
 *
 * The idea is to make the sequence expression consumable for callable expressions.
 * Check the following examples carefully.
 *
 * This helper is heavily used by component tag.
 *
 * ```
 * ('foo.bar', title = 'hello')
 * // returns ['foo.bar', { title: 'hello' }]
 *
 * ('foo.bar', { title: 'hello' })
 * // returns ['foo.bar', { title: 'hello' }]
 *
 * (user.alert, { title: 'hello' })
 * // return [ctx.resolve('user').alert, { title: 'hello' }]
 * ```
 */
export function parseSequenceExpression (expression: any, parser: Parser): [string, string] {
  if (expression.type === 'SequenceExpression') {
    const objectifyString = new ObjectifyString()
    const name = parser.statementToString(expression.expressions.shift())

    expression.expressions.forEach((arg) => {
      if (arg.type === 'ObjectExpression') {
        arg.properties.forEach((prop) => {
          const key = parser.statementToString(prop.key)
          const value = parser.statementToString(prop.value)
          objectifyString.add(key, value)
        })
      }

      if (arg.type === 'AssignmentExpression') {
        objectifyString.add(arg.left.name, parser.statementToString(arg.right))
      }
    })

    return [name, objectifyString.flush()]
  }

  const name = parser.statementToString(expression)
  return [name, `{}`]
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
