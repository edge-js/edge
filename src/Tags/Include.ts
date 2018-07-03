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
import { BaseTag } from './BaseTag'

export class IncludeTag extends BaseTag {
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
    this._validateExpression(parsed, token.lineno)
    buffer.writeLine(`template.renderInline(${parser.statementToString(parsed)})(template, ctx)`)
  }
}
