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
    const parsed = parser.generateEdgeExpression(token.properties.jsArg, token.loc)
    disAllowExpressions(
      parsed,
      [expressions.SequenceExpression],
      parser.options.filename,
      `{${token.properties.jsArg}} is not a valid argument type for the @if tag`,
    )

    /**
     * Start if block
     */
    buffer.writeStatement(`if(${parser.stringifyExpression(parsed)}) {`)

    /**
     * Indent upcoming code
     */
    buffer.indent()

    /**
     * Process of all kids recursively
     */
    token.children.forEach((child) => parser.processLexerToken(child, buffer))

    /**
     * Remove identation
     */
    buffer.dedent()

    /**
     * Close if block
     */
    buffer.writeStatement('}')
  },
}
