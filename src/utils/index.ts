/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { UnAllowedExpressionException, TooManyArgumentsException } from '../Exceptions'
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
    throw UnAllowedExpressionException.invoke(tag, expression.type, expression.loc.start.line)
  }
}

/**
 * Validates the expression type to not be part of the black
 * listed expressions.
 */
export function disAllowExpressions (tag: string, expression: any, expressions: string[]) {
  if (expressions.indexOf(expression.type) > -1) {
    throw UnAllowedExpressionException.invoke(tag, expression.type, expression.loc.start.line)
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
 * Parses an expression as a key/value pair and has following constraints.
 *
 * 1. Top level expression must be `Literal` or `SequenceExpression`.
 * 2. If `SequenceExpression`, then first child of expression must be `Literal`
 * 3. Length of `SequenceExpression` childs must be 2 at max.
 *
 * Optionally, you can enforce (3rd argument) that value in the key/value pair must be one
 * of the given expressions.
 *
 * ```
 * // Following are the valid expressions
 * ('foo', 'bar')
 * ('foo')
 * ('foo', bar)
 * ('foo', { bar: true })
 * ```
 */
export function parseAsKeyValuePair (expression: any, parser: Parser, valueExpressions: string[]): [string, null | string] {
    allowExpressions('slot', expression, ['Literal', 'SequenceExpression'])

    /**
     * Return without counting props, value is a literal
     */
    if (expression.type === 'Literal') {
      return [expression.raw, null]
    }

    /**
     * Raise error when more than 2 arguments are passed to the slot
     * expression
     */
    if (expression.expressions.length > 2) {
      throw TooManyArgumentsException.invoke('slot', 2, expression.loc.start.line)
    }

    allowExpressions('slot', expression.expressions[0], ['Literal'])

    if (valueExpressions.length) {
      allowExpressions('slot', expression.expressions[1], valueExpressions)
    }

    /**
     * Finally return the name and prop name for the slot
     */
    return [expression.expressions[0].raw, parser.statementToString(expression.expressions[1])]
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
