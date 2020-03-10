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
import { isNotSubsetOf, unallowedExpression } from '../utils'

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
    const parsed = parser.utils.transformAst(
      parser.utils.generateAST(token.properties.jsArg, token.loc, token.filename),
      token.filename,
    )

    isNotSubsetOf(
      parsed,
      [expressions.SequenceExpression],
      () => {
        unallowedExpression(
          `{${token.properties.jsArg}} is not a valid argument type for the @elseif tag`,
          parsed,
          token.filename,
        )
      }
    )

    /**
     * Start else block
     */
    buffer.writeStatement(`} else if (${parser.utils.stringify(parsed)}) {`, token.filename, token.loc.start.line)
  },
}
