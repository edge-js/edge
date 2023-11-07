/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EdgeError } from 'edge-error'
import { expressions } from 'edge-parser'

import { TagContract } from '../types.js'
import { ALLOWED_EXPRESSION, getRenderExpression } from './include.js'
import { unallowedExpression, isSubsetOf, parseJsArg, isNotSubsetOf } from '../utils.js'

/**
 * Include tag is used to include partials in the same scope of the parent
 * template.
 *
 * ```edge
 * @include('partials.header')
 * ```
 */
export const includeIfTag: TagContract = {
  block: false,
  seekable: true,
  tagName: 'includeIf',

  /**
   * Compiles else block node to Javascript else statement
   */
  compile(parser, buffer, token) {
    const awaitKeyword = parser.asyncMode ? 'await ' : ''
    const parsed = parseJsArg(parser, token)

    /**
     * The include if only accepts the sequence expression
     */
    isSubsetOf(parsed, [expressions.SequenceExpression], () => {
      unallowedExpression(
        `"${token.properties.jsArg}" is not a valid argument type for the @includeIf tag`,
        token.filename,
        parser.utils.getExpressionLoc(parsed)
      )
    })

    /**
     * Disallow more than or less than 2 values for the sequence expression
     */
    if (parsed.expressions.length !== 2) {
      throw new EdgeError('@includeIf expects a total of 2 arguments', 'E_ARGUMENTS_MIS_MATCH', {
        line: parsed.loc.start.line,
        col: parsed.loc.start.column,
        filename: token.filename,
      })
    }

    const [conditional, include] = parsed.expressions

    isNotSubsetOf(conditional, [expressions.SequenceExpression], () => {
      unallowedExpression(
        `"${conditional.type}" is not a valid 1st argument type for the @includeIf tag`,
        token.filename,
        parser.utils.getExpressionLoc(conditional)
      )
    })

    isSubsetOf(include, ALLOWED_EXPRESSION, () => {
      unallowedExpression(
        `"${include.type}" is not a valid 2nd argument type for the @includeIf tag`,
        token.filename,
        parser.utils.getExpressionLoc(include)
      )
    })

    buffer.writeStatement(
      `if (${parser.utils.stringify(conditional)}) {`,
      token.filename,
      token.loc.start.line
    )
    buffer.outputExpression(
      `${awaitKeyword}${getRenderExpression(parser, include)}`,
      token.filename,
      token.loc.start.line,
      false
    )
    buffer.writeStatement('}', token.filename, -1)
  },
}
