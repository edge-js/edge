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
    let yieldCounter = buffer['yieldCounter'] || 0
    buffer['yieldCounter'] = yieldCounter++

    const parsed = parser.utils.transformAst(
      parser.utils.generateAST(token.properties.jsArg, token.loc, token.filename),
      token.filename,
    )

    isNotSubsetOf(
      parsed,
      [expressions.SequenceExpression],
      () => {
        unallowedExpression(
          `"${token.properties.jsArg}" is not a valid argument type for the @yield tag`,
          parsed,
          token.filename,
        )
      },
    )

    const parsedString = parser.utils.stringify(parsed)

    /**
     * Write main content when it's truthy
     */
    buffer.writeExpression(`let yield_${yieldCounter} = ${parsedString}`, token.filename, token.loc.start.line)
    buffer.writeStatement(`if (yield_${yieldCounter}) {`, token.filename, -1)
    buffer.outputExpression(`yield_${yieldCounter}`, token.filename, -1, true)

    /**
     * Else write fallback
     */
    if (!token.properties.selfclosed) {
      buffer.writeStatement('} else {', token.filename, -1)
      token.children.forEach((child) => (parser.processToken(child, buffer)))
    }

    buffer.writeStatement('}', token.filename, -1)
  },
}
