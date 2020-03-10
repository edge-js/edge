/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { EdgeError } from 'edge-error'
import { expressions } from 'edge-parser'

import { TagContract } from '../Contracts'
import { isSubsetOf, unallowedExpression } from '../utils'

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
    const parsed = parser.utils.transformAst(
      parser.utils.generateAST(token.properties.jsArg, token.loc, token.filename),
      token.filename,
    )

    /**
     * The set tag only accepts a sequence expression.
     */
    isSubsetOf(
      parsed,
      [expressions.SequenceExpression],
      () => {
        throw unallowedExpression(
          `"${token.properties.jsArg}" is not a valid key-value pair for the @slot tag`,
          parsed,
          token.filename,
        )
      },
    )

    /**
     * Disallow more than 2 values for the sequence expression
     */
    if (parsed.expressions.length > 3) {
      throw new EdgeError('maximum of 3 arguments are allowed for the @set tag', 'E_MAX_ARGUMENTS', {
        line: parsed.loc.start.line,
        col: parsed.loc.start.column,
        filename: token.filename,
      })
    }

    const [key, value, isolated] = parsed.expressions

    /**
     * The key has to be a literal value
     */
    isSubsetOf(
      key,
      [expressions.Literal],
      () => {
        throw unallowedExpression(
          'The first argument for @set tag must be a string literal',
          parsed,
          token.filename,
        )
      },
    )

    /**
     * Write statement to mutate the key
     */
    buffer.writeExpression(
      `ctx.set(${key.raw}, ${parser.utils.stringify(value)}, ${!!isolated})`,
      token.filename,
      token.loc.start.line,
    )
  },
}
