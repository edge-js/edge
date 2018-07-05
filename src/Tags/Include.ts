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

export class IncludeTag {
  public static block = false
  public static seekable = true
  public static selfclosed = false

  /**
   * Expressions which are not allowed by the sequence
   * expression
   *
   * @type {Array}
   */
  protected bannedExpressions = ['SequenceExpression']

  /**
   * Compiles else block node to Javascript else statement
   */
  public compile (parser: Parser, buffer: EdgeBuffer, token: IBlockNode) {
    const parsed = parser.parseJsArg(token.properties.jsArg, token.lineno)
    disAllowExpressions('include', parsed, this.bannedExpressions)

    /**
     * Include template. Since the partials can be a runtime value, we cannot inline
     * the content right now and have to defer to runtime to get the value of
     * the partial and then process it
     */
    buffer.writeLine(`template.renderInline(${parser.statementToString(parsed)})(template, ctx)`)
  }
}
