/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expressions } from 'edge-parser'
import lodash from '@poppinss/utils/lodash'

import { TagContract } from '../types.js'
import { isSubsetOf, unallowedExpression } from '../utils.js'

/**
 * The let tag is used to set runtime values within the template. The value
 * is set inside the current scope of the template.
 */
export const letTag: TagContract = {
  block: false,
  seekable: true,
  tagName: 'let',
  noNewLine: true,

  /**
   * Compiles else block node to Javascript else statement
   */
  compile(parser, buffer, token) {
    const parsed = parser.utils.generateAST(
      `let ${token.properties.jsArg}`,
      token.loc,
      token.filename
    ).declarations[0]

    const key = parsed.id
    const value = parsed.init

    /**
     * The variable name has to be an identifier or the destructuring
     * operator.
     */
    isSubsetOf(key, ['ObjectPattern', expressions.Identifier, 'ArrayPattern'], () => {
      throw unallowedExpression(
        `Invalid variable name for the @let tag`,
        token.filename,
        parser.utils.getExpressionLoc(key)
      )
    })

    /**
     * Define local variables based upon the expression
     */
    if (key.type === 'Identifier') {
      parser.stack.defineVariable(key.name)
    } else if (key.type === 'ObjectPattern') {
      key.properties.forEach((property: any) => {
        parser.stack.defineVariable(
          property.argument ? property.argument.name : property.value.name
        )
      })
    } else if (key.type === 'ArrayPattern') {
      key.elements.forEach((element: any) => {
        parser.stack.defineVariable(element.argument ? element.argument.name : element.name)
      })
    }

    /**
     * Declare let variable
     */
    const expression = `let ${parser.utils.stringify(key)} = ${parser.utils.stringify(
      parser.utils.transformAst(value, token.filename, parser)
    )}`

    buffer.writeExpression(expression, token.filename, token.loc.start.line)
  },

  /**
   * Add methods to the template for running the loop
   */
  boot(template) {
    template.macro('setValue', lodash.set)
  },
}
