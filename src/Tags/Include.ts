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
import { allowExpressions } from '../utils'

/**
 * Include tag is used to include partials in the same scope of the parent
 * template.
 *
 * ```edge
 * @include('partials.header')
 * ```
 */
export const includeTag: TagContract = {
  block: false,
  seekable: true,
  tagName: 'include',

  /**
   * Compiles else block node to Javascript else statement
   */
  compile (parser, buffer, token) {
    const parsed = parser.generateEdgeExpression(token.properties.jsArg, token.loc)
    allowExpressions(
      parsed,
      [
        expressions.Identifier,
        expressions.Literal,
        expressions.LogicalExpression,
        expressions.MemberExpression,
        expressions.ConditionalExpression,
        expressions.CallExpression,
        expressions.TemplateLiteral,
      ],
      parser.options.filename,
      `{${token.properties.jsArg}} is not a valid argument type for the @include tag`,
    )

    /**
     * Include template. Since the partials can be a runtime value, we cannot inline
     * the content right now and have to defer to runtime to get the value of
     * the partial and then process it
     */
    buffer.writeLine(`template.renderInline(${parser.stringifyExpression(parsed)})(template, ctx)`)
  },
}
