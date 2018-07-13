/**
 * @module tags
 */

/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Parser } from 'edge-parser'
import { EdgeBuffer } from 'edge-parser/build/src/EdgeBuffer'
import { IBlockNode } from 'edge-lexer/build/src/Contracts'
import { allowExpressions } from '../utils'

export class YieldTag {
  public static block = true
  public static seekable = true
  public static selfclosed = true
  public static tagName = 'yield'

  /**
   * Expressions which are not allowed by the sequence
   * expression
   *
   * @type {Array}
   */
  private static allowedExpressions = ['Identifier', 'Literal', 'MemberExpression', 'CallExpression']

  /**
   * Compiles the if block node to a Javascript if statement
   */
  public static compile (parser: Parser, buffer: EdgeBuffer, token: IBlockNode) {
    const parsed = parser.parseJsArg(token.properties.jsArg, token.lineno)
    allowExpressions('yield', parsed, this.allowedExpressions, parser.options.filename)

    /**
     * Start if block
     */
    const parsedString = parser.statementToString(parsed)

    /**
     * If main content is truthy
     */
    buffer.writeStatement(`if(${parsedString}) {`)
    buffer.indent()
    buffer.writeLine(parsedString)
    buffer.dedent()
    buffer.writeStatement('} else {')

    /**
     * Else write fallback
     */
    buffer.indent()
    token.children.forEach((child, index) => (parser.processToken(child, buffer)))
    buffer.dedent()
    buffer.writeStatement('}')
  }
}
