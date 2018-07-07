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
import { UnAllowedExpressionException, TooManyArgumentsException } from '../Exceptions'
import { parseSequenceExpression, ObjectifyString } from '../utils'

export class ComponentTag {
  public static block = true
  public static seekable = true
  public static selfclosed = true
  public static tagName = 'component'

  /**
   * Returns the slot name and the slot prop name.
   */
  private _getNameAndPropsName (statement: IBlockNode, parser: Parser): [string, string | null] {
    const ast = parser.generateAst(statement.properties.jsArg, statement.lineno)
    const expression = ast.body[0].expression

    /**
     * Return without counting props, value is a literal
     */
    if (expression.type === 'Literal') {
      return [expression.raw, null]
    }

    /**
     * Raise error when not a sequence expression
     */
    if (expression.type !== 'SequenceExpression') {
      throw UnAllowedExpressionException.invoke('slot', expression.type, expression.loc.start.line)
    }

    /**
     * Raise error when more than 2 arguments are passed to the slot
     * expression
     */
    if (expression.expressions.length > 2) {
      throw TooManyArgumentsException.invoke('slot', 2, expression.loc.start.line)
    }

    /**
     * Raise error when first expression or sequence expressions is not a literal.
     * Since slot name must be a string
     */
    if (expression.expressions[0].type !== 'Literal') {
      throw UnAllowedExpressionException
        .invoke('slot', expression.expressions[0].type, expression.expressions[0].loc.start.line)
    }

    /**
     * Raise error when 2nd expression of the sequence expressions is not an indentifier.
     * Since slot prop has to be an identifier
     */
    if (expression.expressions[1].type !== 'Identifier') {
      throw UnAllowedExpressionException
        .invoke('slot', expression.expressions[1].type, expression.expressions[1].loc.end.line)
    }

    /**
     * Finally return the name and prop name for the slot
     */
    return [expression.expressions[0].raw, expression.expressions[1].name]
  }

  /**
   * Compiles else block node to Javascript else statement
   */
  public compile (parser: Parser, buffer: EdgeBuffer, token: IBlockNode) {
    const parsed = parser.generateAst(token.properties.jsArg, token.lineno)
    const expression = parser.parseStatement(parsed.body[0])
    let [name, props] = parseSequenceExpression(expression, parser)

    const slots = {}

    token.children.forEach((child, index) => {
      let slotName: string = `'main'`
      let slotProps: string | null = null

      if (child.type === 'block' && (child as IBlockNode).properties.name === 'slot') {
        const parsed = this._getNameAndPropsName((child as IBlockNode), parser)
        slotName = parsed[0]
        slotProps = parsed[1]
      }

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
