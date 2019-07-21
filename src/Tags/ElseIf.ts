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
import { TagToken } from 'edge-lexer/build/src/Contracts'
import { disAllowExpressions } from '../utils'

export class ElseIfTag {
  public static block = false
  public static seekable = true
  public static selfclosed = false
  public static tagName = 'elseif'

  private static bannedExpressions = ['SequenceExpression']

  /**
   * Compiles the else if block node to a Javascript if statement
   */
  public static compile (parser: Parser, buffer: EdgeBuffer, token: TagToken) {
    const parsed = parser.parseJsString(token.properties.jsArg, token.loc)
    disAllowExpressions('elseif', parsed, this.bannedExpressions, parser.options.filename)

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
