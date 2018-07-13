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
import { disAllowExpressions } from '../utils'

export class UnlessTag {
  public static block = true
  public static seekable = true
  public static selfclosed = false
  public static tagName = 'unless'

  /**
   * Expressions which are not allowed by the sequence
   * expression
   *
   * @type {Array}
   */
  private static bannedExpressions = ['SequenceExpression']

  /**
   * Compiles the if block node to a Javascript if statement
   */
  public static compile (parser: Parser, buffer: EdgeBuffer, token: IBlockNode) {
    const parsed = parser.parseJsArg(token.properties.jsArg, token.lineno)
    disAllowExpressions('unless', parsed, this.bannedExpressions, parser.options.filename)

    /**
     * Start if block
     */
    buffer.writeStatement(`if(!${parser.statementToString(parsed)}) {`)

    /**
     * Indent upcoming code
     */
    buffer.indent()

    /**
     * Process of all kids recursively
     */
    token.children.forEach((child, index) => {
      parser.processToken(child, buffer)
    })

    /**
     * Remove identation
     */
    buffer.dedent()

    /**
     * Close if block
     */
    buffer.writeStatement('}')
  }
}
