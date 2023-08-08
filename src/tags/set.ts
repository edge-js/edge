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
import lodash from '@poppinss/utils/lodash'

import { TagContract } from '../types.js'
import { isSubsetOf, unallowedExpression, parseJsArg } from '../utils.js'

declare module '../template.js' {
  export interface Template {
    setValue: (typeof lodash)['set']
  }
}

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
  noNewLine: true,

  /**
   * Compiles else block node to Javascript else statement
   */
  compile(parser, buffer, token) {
    const parsed = parseJsArg(parser, token)

    /**
     * The set tag only accepts a sequence expression.
     */
    isSubsetOf(parsed, [expressions.SequenceExpression], () => {
      throw unallowedExpression(
        `"${token.properties.jsArg}" is not a valid key-value pair for the @slot tag`,
        token.filename,
        parser.utils.getExpressionLoc(parsed)
      )
    })

    /**
     * Disallow less than 2 and more than 3 values for the sequence
     * expression
     */
    if (parsed.expressions.length < 2 || parsed.expressions.length > 3) {
      throw new EdgeError(
        '@set tag accepts a minimum of 2 or maximum or 3 arguments',
        'E_INVALID_ARGUMENTS_COUNT',
        {
          line: parsed.loc.start.line,
          col: parsed.loc.start.column,
          filename: token.filename,
        }
      )
    }

    /**
     * Extract key-value and the collection (if any)
     */
    let collection: any
    let key: any
    let value: any

    if (parsed.expressions.length === 3) {
      collection = parsed.expressions[0]
      key = parsed.expressions[1]
      value = parsed.expressions[2]
    } else {
      key = parsed.expressions[0]
      value = parsed.expressions[1]
    }

    /**
     * Mutate the collection when defined
     */
    if (collection) {
      buffer.writeExpression(
        `template.setValue(${parser.utils.stringify(collection)}, '${
          key.value
        }', ${parser.utils.stringify(value)})`,
        token.filename,
        token.loc.start.line
      )
      return
    }

    /**
     * Write statement to mutate the key. If the variable has already been
     * defined, then just update it's value.
     *
     * We do not allow re-declaring a variable as of now
     */
    const expression = parser.stack.has(key.value)
      ? `${key.value} = ${parser.utils.stringify(value)}`
      : `let ${key.value} = ${parser.utils.stringify(value)}`

    buffer.writeExpression(expression, token.filename, token.loc.start.line)
    parser.stack.defineVariable(key.value)
  },

  /**
   * Add methods to the template for running the loop
   */
  boot(template) {
    template.macro('setValue', lodash.set)
  },
}
