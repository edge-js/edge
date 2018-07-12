/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Parser } from 'edge-parser'
import { sep } from 'path'
import { EdgeError } from 'edge-error'
import { INode, IBlockNode } from 'edge-lexer/build/src/Contracts'

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
export function allowExpressions (tag: string, expression: any, expressions: string[], filename: string) {
  if (expressions.indexOf(expression.type) === -1) {
    throw new EdgeError(`${expression.type} is not allowed for ${tag} tag.`, 'E_UNALLOWED_EXPRESSION', {
      line: expression.loc.start.line,
      col: expression.loc.start.column,
      filename: filename,
    })
  }
}

/**
 * Validates the expression type to not be part of the black
 * listed expressions.
 */
export function disAllowExpressions (tag: string, expression: any, expressions: string[], filename) {
  if (expressions.indexOf(expression.type) > -1) {
    throw new EdgeError(`${expression.type} is not allowed for ${tag} tag.`, 'E_UNALLOWED_EXPRESSION', {
      line: expression.loc.start.line,
      col: expression.loc.start.column,
      filename: filename,
    })
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
    allowExpressions('slot', expression, ['Literal', 'SequenceExpression'], parser.options.filename)

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
      throw new EdgeError('Maximum of 2 arguments are allowed for slot tag', 'E_MAX_ARGUMENTS', {
        line: expression.loc.start.line,
        col: expression.loc.start.column,
        filename: parser.options.filename,
      })
    }

    allowExpressions('slot', expression.expressions[0], ['Literal'], parser.options.filename)

    if (valueExpressions.length) {
      allowExpressions('slot', expression.expressions[1], valueExpressions, parser.options.filename)
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

/**
 * Finds a section token in the list of tokens.
 */
export function isBlock (token: INode, name: string): boolean {
  return token.type === 'block' && (token as IBlockNode).properties.name === name
}

/**
 * Returns a boolean telling if the current token
 * first children is a super tag
 */
export function hasChildSuper (token: IBlockNode): boolean {
  if (!token.children.length) {
    return false
  }

  if (token.children[0].type !== 'block') {
    return false
  }

  return (token.children[0] as IBlockNode).properties.name === 'super'
}

/**
 * Merges the section tags content of 2 tokens list. The name of the sections
 * are used for merging.
 */
export function mergeSections (base: INode[], extended: INode[]): INode[] {
  /**
   * Collection all sections from the extended tokens
   */
  const extendedSections = extended
    .filter((node) => isBlock(node, 'section'))
    .reduce((sections, node: IBlockNode) => {
      sections[node.properties.jsArg.trim()] = node
      return sections
    }, {})

   /**
    * We also take the set tag from the list
    * base template and hoist them to the
    * top
    */
  const extendedSetCalls = extended.filter((node) => isBlock(node, 'set'))

  /**
   * Replace/extend sections inside base tokens list
   */
  const finalNodes = base
    .map((node) => {
      if (!isBlock(node, 'section')) {
        return node
      }

      const blockNode = node as IBlockNode
      const extendedNode = extendedSections[blockNode.properties.jsArg]
      if (!extendedNode) {
        return blockNode
      }

      /**
       * Concat children when super was called
       */
      if (hasChildSuper(extendedNode)) {
        extendedNode.children = blockNode.children.concat(extendedNode.children)
      }

      return extendedNode
    })

  return extendedSetCalls.concat(finalNodes)
}
