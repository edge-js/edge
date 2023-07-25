/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { TagContract } from '../types.js'

/**
 * Add debugger break point to the compiled template
 */
export const debuggerTag: TagContract = {
  block: false,
  seekable: false,
  tagName: 'debugger',
  noNewLine: true,

  /**
   * Compiles `@debugger` tags
   */
  compile(_, buffer, token) {
    buffer.writeExpression('debugger', token.filename, token.loc.start.line)
  },
}
