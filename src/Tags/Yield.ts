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
 * Yield tag is a shorthand of `if/else` for markup based content.
 *
 * ```edge
 * @yield($slots.main)
 *   <p> This is the fallback content, when $slots.main is missing </p>
 * @endyield
 * ```
 *
 * The longer version of above is following
 *
 * ```@edge
 * @if ($slots.main)
 *   {{{ $slots.main }}}
 * @else
 *   <p> This is the fallback content, when $slots.main is missing </p>
 * @endif
 * ```
 */
export const yieldTag: TagContract = {
  block: true,
  seekable: true,
  tagName: 'yield',

  /**
   * Compiles the if block node to a Javascript if statement
   */
  compile (parser, buffer, token) {
    const parsed = parser.parseJsString(token.properties.jsArg, token.loc)
    disAllowExpressions(
      parsed,
      [expressions.SequenceExpression],
      parser.options.filename,
      `{${token.properties.jsArg}} is not a valid argument type for the @yield tag`,
    )

    const parsedString = parser.statementToString(parsed)

    /**
     * Write main content when it's truthy
     */
    buffer.writeStatement(`if(${parsedString}) {`)
    buffer.indent()
    buffer.writeLine(parsedString)
    buffer.dedent()
    buffer.writeStatement('} else {')

    /**
     * Else write fallback
     */
    buffer.indent()
    token.children.forEach((child) => (parser.processToken(child, buffer)))
    buffer.dedent()
    buffer.writeStatement('}')
  },
}
