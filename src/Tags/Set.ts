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
import { EdgeError } from 'edge-error'

import { TagContract } from '../Contracts'
import { allowExpressions } from '../utils'

/**
 * The set tag is used to set runtime values within the template. The value
 * is set inside the current scope of the template.
 *
 * ```edge
 * @set('user.username', 'virk')
 * <p> {{ user.username }} </p>
 * ```
 *
 * Set it inside the each loop.
 *
 * ```edge
 * @each(user in users)
 *   @set('age', user.age + 1)
 *   {{ age }}
 * @endeach
 * ```
 */
export const setTag: TagContract = {
  block: false,
  seekable: true,
  tagName: 'set',

  /**
   * Compiles else block node to Javascript else statement
   */
  compile (parser, buffer, token) {
    const parsed = parser.parseJsString(token.properties.jsArg, token.loc)

    /**
     * The set tag only accepts a sequence expression.
     */
    allowExpressions(
      parsed,
      [expressions.SequenceExpression],
      parser.options.filename,
      `{${token.properties.jsArg}} is not a valid key-value pair for the @slot tag`,
    )

    /**
     * Disallow more than 2 values for the sequence expression
     */
    if (parsed.expressions.length > 2) {
      throw new EdgeError(`maximum of 2 arguments are allowed for the @set tag`, 'E_MAX_ARGUMENTS', {
        line: parsed.loc.start.line,
        col: parsed.loc.start.column,
        filename: parser.options.filename,
      })
    }

    const [key, value] = parsed.expressions

    /**
     * The key has to be a literal value
     */
    allowExpressions(
      key,
      [expressions.Literal],
      parser.options.filename,
      'The first argument for @set tag must be a string literal',
    )

    /**
     * Write statement to mutate the key
     */
    buffer.writeStatement(`ctx.set(${key.raw}, ${parser.statementToString(value)})`)
  },
}
