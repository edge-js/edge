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
import { isNotSubsetOf, unallowedExpression, parseJsArg } from '../utils.js'

/**
 * Else if tag is used to define conditional blocks. We keep `@elseif` tag
 * is a inline tag, so that everything between the `if` and the `elseif`
 * comes `if` children.
 */
export const elseIfTag: TagContract = {
  block: false,
  seekable: true,
  tagName: 'elseif',

  /**
   * Compiles the else if block node to a Javascript if statement
   */
  compile(parser, buffer, token) {
    const parsed = parseJsArg(parser, token)

    /**
     * Disallow sequence expressions
     */
    isNotSubsetOf(parsed, [expressions.SequenceExpression], () => {
      unallowedExpression(
        `{${token.properties.jsArg}} is not a valid argument type for the @elseif tag`,
        token.filename,
        parser.utils.getExpressionLoc(parsed)
      )
    })

    /**
     * Start else if block
     */
    buffer.writeStatement(
      `} else if (${parser.utils.stringify(parsed)}) {`,
      token.filename,
      token.loc.start.line
    )
  },
}
