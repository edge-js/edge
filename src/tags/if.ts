/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expressions } from 'edge-parser'

import { TagContract } from '../types.js'
import { unallowedExpression, isNotSubsetOf, parseJsArg } from '../utils.js'

/**
 * If tag is used to define conditional blocks.
 */
export const ifTag: TagContract = {
  block: true,
  seekable: true,
  tagName: 'if',

  /**
   * Compiles the if block node to a Javascript if statement
   */
  compile(parser, buffer, token) {
    const parsed = parseJsArg(parser, token)

    /**
     * Disallow sequence expressions
     */
    isNotSubsetOf(parsed, [expressions.SequenceExpression], () => {
      unallowedExpression(
        `"${token.properties.jsArg}" is not a valid argument type for the @if tag`,
        token.filename,
        parser.utils.getExpressionLoc(parsed)
      )
    })

    /**
     * Start if block
     */
    buffer.writeStatement(
      `if (${parser.utils.stringify(parsed)}) {`,
      token.filename,
      token.loc.start.line
    )

    /**
     * Process of all children recursively
     */
    token.children.forEach((child) => parser.processToken(child, buffer))

    /**
     * Close if block
     */
    buffer.writeStatement('}', token.filename, -1)
  },
}
