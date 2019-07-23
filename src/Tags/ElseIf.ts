/**
 * @module edge
 */

/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { expressions } from 'edge-parser'
import { TagContract } from '../Contracts'
import { disAllowExpressions } from '../utils'

/**
 * Else if tag is used to define conditional blocks.
 *
 * ```edge
 * @if(username)
 *   // If
 * @elseif(user.username)
 *   // Else if
 * @endif
 * ```
 */
export const elseIfTag: TagContract = {
  block: false,
  seekable: true,
  tagName: 'elseif',

  /**
   * Compiles the else if block node to a Javascript if statement
   */
  compile (parser, buffer, token) {
    const parsed = parser.parseJsString(token.properties.jsArg, token.loc)
    disAllowExpressions(
      parsed,
      [expressions.SequenceExpression],
      parser.options.filename,
      `{${token.properties.jsArg}} is not a valid argument type for the @elseif tag`,
    )

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
  },
}
