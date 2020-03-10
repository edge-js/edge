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
import { unallowedExpression, isNotSubsetOf } from '../utils'

/**
 * If tag is used to define conditional blocks.
 *
 * ```edge
 * @if(username)
 * @endif
 * ```
 */
export const ifTag: TagContract = {
  block: true,
  seekable: true,
  tagName: 'if',

  /**
   * Compiles the if block node to a Javascript if statement
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
          `"${token.properties.jsArg}" is not a valid argument type for the @if tag`,
          parsed,
          token.filename,
        )
      },
    )

    /**
     * Start if block
     */
    buffer.writeStatement(`if (${parser.utils.stringify(parsed)}) {`, token.filename, token.loc.start.line)

    /**
     * Process of all kids recursively
     */
    token.children.forEach((child) => parser.processToken(child, buffer))

    /**
     * Close if block
     */
    buffer.writeStatement('}', token.filename, -1)
  },
}
