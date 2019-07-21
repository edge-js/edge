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

import { Parser, EdgeBuffer } from 'edge-parser'

export class ElseTag {
  public static block = false
  public static seekable = false
  public static selfclosed = false
  public static tagName = 'else'

  /**
   * Compiles else block node to Javascript else statement
   */
  public static compile (_parser: Parser, buffer: EdgeBuffer) {
    buffer.dedent()
    buffer.writeStatement(`} else {`)
    buffer.indent()
  }
}
