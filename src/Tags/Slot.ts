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
import { IBlockNode } from 'edge-lexer/build/src/Contracts'

export class SlotTag {
  public static block = true
  public static seekable = true
  public static selfclosed = false
  public static tagName = 'slot'

  /**
   * Compiles else block node to Javascript else statement
   */
  public static compile (parser: Parser, buffer: EdgeBuffer, token: IBlockNode) {
    token.children.forEach((child, index) => {
      parser.processToken(child, buffer)
    })
  }
}
