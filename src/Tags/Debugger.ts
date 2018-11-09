/**
 * @module tags
 */

/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Parser } from 'edge-parser'
import { EdgeBuffer } from 'edge-parser/build/src/EdgeBuffer'

export class DebuggerTag {
  public static block = false
  public static seekable = false
  public static selfclosed = false
  public static tagName = 'debugger'

  /**
   * Compiles else block node to Javascript else statement
   */
  public static compile (_parser: Parser, buffer: EdgeBuffer) {
    buffer.writeStatement('debugger;')
  }
}
