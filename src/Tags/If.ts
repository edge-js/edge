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

export class IfTag {
  public static block = true
  public static seekable = true
  public static selfclosed = false
  public static tagName = 'if'

  /**
   * Expressions which are not allowed by the sequence
   * expression
   *
   * @type {Array}
   */
  protected bannedExpressions = ['SequenceExpression']

  /**
   * Compiles the if block node to a Javascript if statement
   */
  public compile (parser: Parser, buffer: EdgeBuffer, token: IBlockNode) {
    const parsed = parser.parseJsArg(token.properties.jsArg, token.lineno)
    disAllowExpressions('if', parsed, this.bannedExpressions)

    /**
     * Start if block
     */
    buffer.writeStatement(`if(${parser.statementToString(parsed)}) {`)

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
