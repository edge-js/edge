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

export class ElseIfTag {
  public static block = false
  public static seekable = true
  public static selfclosed = false
  public static tagName = 'elseif'

  protected bannedExpressions = ['SequenceExpression']

  /**
   * Compiles the else if block node to a Javascript if statement
   */
  public compile (parser: Parser, buffer: EdgeBuffer, token: IBlockNode) {
    const parsed = parser.parseJsArg(token.properties.jsArg, token.lineno)
    disAllowExpressions('elseif', parsed, this.bannedExpressions)

    /**
     * Dedent block
     */
    buffer.dedent()

    /**
     * Start else block
     */
    buffer.writeStatement(`} else if(${parser.statementToString(parsed)}) {`)

    /**
     * Indent block again
     */
    buffer.indent()
  }
}
