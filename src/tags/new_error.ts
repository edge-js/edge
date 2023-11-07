/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expressions } from 'edge-parser'

import { TagContract } from '../types.js'
import { parseJsArg } from '../utils.js'

/**
 * newError tag to raise exceptions inside your templates. They will point
 * back to the exact line:col in the template
 */
export const newErrorTag: TagContract = {
  block: false,
  seekable: true,
  tagName: 'newError',
  noNewLine: true,

  compile(parser, buffer, token) {
    const parsed = parseJsArg(parser, token)

    let message = ''
    let line: string | number = token.loc.start.line
    let col: string | number = token.loc.start.col
    let filename: string = '$filename'

    if (parsed.type === expressions.SequenceExpression) {
      message = parser.utils.stringify(parsed.expressions[0])
      filename = parsed.expressions[1] ? parser.utils.stringify(parsed.expressions[1]) : '$filename'
      line = parsed.expressions[2]
        ? parser.utils.stringify(parsed.expressions[2])
        : token.loc.start.line
      col = parsed.expressions[3]
        ? parser.utils.stringify(parsed.expressions[3])
        : token.loc.start.col
    } else {
      message = parser.utils.stringify(parsed)
    }

    /**
     * Raise the exception with the correct filename and the line number
     */
    buffer.writeStatement(
      `template.newError(${message}, ${filename}, ${line}, ${col})`,
      token.filename,
      token.loc.start.line
    )
  },
}
