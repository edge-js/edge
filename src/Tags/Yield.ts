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
import { isNotSubsetOf, unallowedExpression, parseJsArg } from '../utils'

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
    /**
     * Holding the yield variable counder on the buffer as a private
     * variable
     */
    let yieldCounter = buffer['yieldCounter'] || 0
    buffer['yieldCounter'] = yieldCounter++

    const parsed = parseJsArg(parser, token)

    /**
     * Sequence expression is not
     */
    isNotSubsetOf(
      parsed,
      [expressions.SequenceExpression],
      () => {
        unallowedExpression(
          `"${token.properties.jsArg}" is not a valid argument type for the @yield tag`,
          token.filename,
          parser.utils.getExpressionLoc(parsed),
        )
      },
    )

    const parsedString = parser.utils.stringify(parsed)

    /**
     * Write main content when it's truthy. The reason we store a reference to a variable first, is that
     * at times the properties can have side-effects, so calling it inside `if` and then yield may
     * cause unintended behavior. For example:
     *
     * `@yield(getPropertyAge())`
     *
     * The `getPropertyAge` uses timestamp comparsion for some logic. So if we will call this method
     * twice, first inside the `if` block and then to yield it, then it may cause some unintended
     * behavior.
     */
    buffer.writeExpression(`let yield_${yieldCounter} = ${parsedString}`, token.filename, token.loc.start.line)
    buffer.writeStatement(`if (yield_${yieldCounter}) {`, token.filename, -1)
    buffer.outputExpression(`yield_${yieldCounter}`, token.filename, -1, true)

    /**
     * Write fallback content
     */
    if (!token.properties.selfclosed) {
      buffer.writeStatement('} else {', token.filename, -1)
      token.children.forEach((child) => (parser.processToken(child, buffer)))
    }

    buffer.writeStatement('}', token.filename, -1)
  },
}
