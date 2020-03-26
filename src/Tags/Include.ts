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
import { unallowedExpression, isSubsetOf, parseJsArg } from '../utils'

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
    const parsed = parseJsArg(parser, token)

    /**
     * Only mentioned expressions are allowed inside `@include` tag
     */
    isSubsetOf(
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
      () => {
        unallowedExpression(
          `"${token.properties.jsArg}" is not a valid argument type for the @include tag`,
          parsed,
          token.filename,
        )
      },
    )

    /**
     * We need to pass the local variables to the partial render function
     */
    const localVariables = parser.stack.list()

    /**
     * Arguments for the `renderInline` method
     */
    const renderArgs = localVariables.length
      ? [parser.utils.stringify(parsed), localVariables.map((localVar) => `"${localVar}"`).join(',')]
      : [parser.utils.stringify(parsed)]

    /**
     * Arguments for invoking the output function of `renderInline`
     */
    const callFnArgs = localVariables.length
      ? ['template', 'state', 'ctx', localVariables.map((localVar) => localVar).join(',')]
      : ['template', 'state', 'ctx']

    buffer.outputExpression(
      `template.renderInline(${renderArgs.join(',')})(${callFnArgs.join(',')})`,
      token.filename,
      token.loc.start.line,
      true,
    )
  },
}
