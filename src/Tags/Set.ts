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

import { TagToken } from 'edge-lexer'
import { Parser, EdgeBuffer } from 'edge-parser'
import { parseAsKeyValuePair } from '../utils'

export class SetTag {
  public static block = false
  public static seekable = true
  public static selfclosed = false
  public static tagName = 'set'

  /**
   * Compiles else block node to Javascript else statement
   */
  public static compile (parser: Parser, buffer: EdgeBuffer, token: TagToken) {
    const ast = parser.parseJsString(token.properties.jsArg, token.loc)
    const [key, value] = parseAsKeyValuePair(ast, parser, [])
    buffer.writeStatement(`ctx.set(${key}, ${value})`)
  }
}
