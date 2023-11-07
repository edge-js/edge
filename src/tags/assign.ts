/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expressions } from 'edge-parser'
import lodash from '@poppinss/utils/lodash'

import { TagContract } from '../types.js'
import { isSubsetOf, parseJsArg, unallowedExpression } from '../utils.js'

/**
 * The assign tag is used to re-assign value to an existing variable
 */
export const assignTag: TagContract = {
  block: false,
  seekable: true,
  tagName: 'assign',
  noNewLine: true,

  /**
   * Compiles else block node to Javascript else statement
   */
  compile(parser, buffer, token) {
    const parsed = parseJsArg(parser, token)

    isSubsetOf(parsed, [expressions.AssignmentExpression], () => {
      throw unallowedExpression(
        `Invalid expression for the @assign tag`,
        token.filename,
        parser.utils.getExpressionLoc(parsed)
      )
    })

    buffer.writeExpression(parser.utils.stringify(parsed), token.filename, token.loc.start.line)
  },

  /**
   * Add methods to the template for running the loop
   */
  boot(template) {
    template.macro('setValue', lodash.set)
  },
}
