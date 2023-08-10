/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parseJsArg } from '../utils.js'
import type { TagContract } from '../types.js'

/**
 * The eval tag accepts expressions similar to double curly
 * braces. However, it does not write anything to the
 * output.
 */
export const evalTag: TagContract = {
  block: false,
  seekable: true,
  tagName: 'eval',
  noNewLine: true,

  /**
   * Compiles the tag AST
   */
  compile(parser, buffer, token) {
    const parsed = parseJsArg(parser, token)
    buffer.writeExpression(parser.utils.stringify(parsed), token.filename, token.loc.start.line)
  },
}
