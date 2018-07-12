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

export class LayoutTag {
  public static block = false
  public static seekable = true
  public static selfclosed = false
  public static tagName = 'layout'

  public static compile (parser: Parser, buffer: EdgeBuffer, token: IBlockNode) {
    // The layouts are handled by the template itself. I am just a way to
    // tell lexer to parse me as a block node
  }
}
