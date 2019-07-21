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
import { TagToken } from 'edge-lexer/build/src/Contracts'
import { parseSequenceExpression, ObjectifyString, parseAsKeyValuePair, isBlock } from '../utils'

export class ComponentTag {
  public static block = true
  public static seekable = true
  public static selfclosed = true
  public static tagName = 'component'

  /**
   * Compiles else block node to Javascript else statement
   */
  public static compile (parser: Parser, buffer: EdgeBuffer, token: TagToken) {
    const parsed = parser.generateAst(token.properties.jsArg, token.loc)
    const expression = parser.acornToEdgeExpression(parsed.body[0])
    let [name, props] = parseSequenceExpression(expression, parser)

    const slots = {}

    /**
     * Loop over all the children and set them as part of slots. If no slot
     * is defined, then it will be main slot.
     */
    token.children.forEach((child, index) => {
      let slotName: string = `'main'`
      let slotProps: string | null = null

      if (isBlock(child, 'slot')) {
        const statement = parser.generateAst(child.properties.jsArg, child.loc)
        const parsed = parseAsKeyValuePair(statement.body[0].expression, parser, ['Identifier'])
        slotName = parsed[0]
        slotProps = parsed[1]
      }

      /**
       * Create a new slot with buffer to process the childs
       */
      if (!slots[slotName]) {
        slots[slotName] = { buffer: new EdgeBuffer(`slot_${index}`), props: slotProps }

        /**
         * Only start the frame, when there are props in use
         * for the given slot
         */
        if (slotProps) {
          slots[slotName].buffer.writeStatement('ctx.newFrame()')
          slots[slotName].buffer.writeStatement(`ctx.setOnFrame('${slotProps}', ${slotProps})`)
        }
      }

      parser.processToken(child, slots[slotName].buffer)
    })

    const obj = new ObjectifyString()
    Object.keys(slots).forEach((slot) => {
      if (slots[slot].props) {
        slots[slot].buffer.writeStatement('ctx.removeFrame()')
      }

      const suffix = slots[slot].props ? `return function (${slots[slot].props}) {` : 'return function () {'
      slots[slot].buffer.wrap(suffix, '}')
      obj.add(slot, slots[slot].buffer.flush(true))
    })

    buffer.writeLine(`template.renderWithState(${name}, ${props}, ${obj.flush()})`)
  }
}
