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
import { parseSequenceExpression, ObjectifyString } from '../utils'

export class ComponentTag {
  public static block = true
  public static seekable = true
  public static selfclosed = true
  public static tagName = 'component'

  /**
   * Compiles else block node to Javascript else statement
   */
  public compile (parser: Parser, buffer: EdgeBuffer, token: IBlockNode) {
    const parsed = parser.generateAst(token.properties.jsArg, token.lineno)
    const expression = parser.parseStatement(parsed.body[0])
    let [name, props] = parseSequenceExpression(expression, parser)

    const slots = {}
    token.children.forEach((child) => {
      let name = `'main'`
      if (child.type === 'block' && (child as IBlockNode).properties.name === 'slot') {
        name = (child as IBlockNode).properties.jsArg
      }

      slots[name] = slots[name] || new EdgeBuffer()
      parser.processToken(child, slots[name])
    })

    const obj = new ObjectifyString()
    Object.keys(slots).forEach((slot) => {
      obj.add(slot, slots[slot].flush())
    })

    buffer.writeLine(`template.renderWithState(${name}, ${props}, ${obj.flush()})`)
  }
}
