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

import { EdgeError } from 'edge-error'
import { EdgeBuffer, expressions, Parser } from 'edge-parser'

import { TagContract } from '../Contracts'
import { StringifiedObject } from '../StringifiedObject'
import { expressionsToStringifyObject, isBlock, allowExpressions } from '../utils'

/**
 * A list of allowed expressions for the component name
 */
const componentNameAllowedExpressions: (keyof typeof expressions)[] = [
  expressions.Identifier,
  expressions.Literal,
  expressions.LogicalExpression,
  expressions.MemberExpression,
  expressions.ConditionalExpression,
  expressions.CallExpression,
  expressions.TemplateLiteral,
]

/**
 * Returns the component name and props by parsing the component jsArg expression
 */
function getComponentNameAndProps (expression: any, parser: Parser): [string, string] {
  let name

  /**
   * Use the first expression inside the sequence expression as the name
   * of the component
   */
  if (expression.type === expressions.SequenceExpression) {
    name = expression.expressions.shift()
  } else {
    name = expression
  }

  /**
   * Ensure the component name is a literal value or an expression that
   * outputs a literal value
   */
  allowExpressions(
    name,
    componentNameAllowedExpressions,
    parser.options.filename,
    `{${parser.statementToString(name)}} is not a valid argument for component name`,
  )

  /**
   * Parse rest of sequence expressions as an objectified string.
   */
  if (expression.type === expressions.SequenceExpression) {
    return [
      parser.statementToString(name),
      expressionsToStringifyObject(expression.expressions, parser),
    ]
  }

  /**
   * When top level expression is not a sequence expression, then we assume props
   * as empty stringified object.
   */
  return [parser.statementToString(name), '{}']
}

/**
 * Parses the slot component to fetch it's name and props
 */
function getSlotNameAndProps (expression: any, parser: Parser): [string, null | string] {
  /**
   * We just generate AST only, since we don't want parser to transform ast to edge statements
   * for a `@slot` tag.
   */
  const parsed = parser.generateAst(expression.properties.jsArg, expression.loc).body[0].expression
  allowExpressions(
    parsed,
    [expressions.Literal, expressions.SequenceExpression],
    parser.options.filename,
    `{${expression.properties.jsArg}} is not a valid argument type for the @slot tag`,
  )

  /**
   * Fetch the slot name
   */
  let name
  if (parsed.type === expressions.SequenceExpression) {
    name = parsed.expressions[0]
  } else {
    name = parsed
  }

  /**
   * Validating the slot name to be a literal value, since slot names cannot be dynamic
   */
  allowExpressions(
    name,
    [expressions.Literal],
    parser.options.filename,
    'slot name must be a valid string literal',
  )

  /**
   * Return the slot name with empty props, when the expression is a literal
   * value.
   */
  if (parsed.type === expressions.Literal) {
    return [name.raw, null]
  }

  /**
   * Make sure the sequence expression has only 2 arguments in it. Though it doesn't hurt
   * the rendering of component, we must not run code with false expectations.
   */
  if (parsed.expressions.length > 2) {
    throw new EdgeError('maximum of 2 arguments are allowed for @slot tag', 'E_MAX_ARGUMENTS', {
      line: parsed.loc.start.line,
      col: parsed.loc.start.column,
      filename: parser.options.filename,
    })
  }

  allowExpressions(
    parsed.expressions[1],
    [expressions.Identifier],
    parser.options.filename,
    `{${parser.statementToString(parsed.expressions[1])}} is not valid prop identifier for @slot tag`,
  )

  /**
   * Returning the slot name and slot props name
   */
  return [name.raw, parsed.expressions[1].name]
}

/**
 * The component tag implementation. It is one of the most complex tags and
 * can be used as a reference for creating other tags.
 */
export const componentTag: TagContract = {
  block: true,
  seekable: true,
  tagName: 'component',

  compile (parser, buffer, token) {
    const parsed = parser.parseJsString(token.properties.jsArg, token.loc)

    /**
     * Check component js props for allowed expressions
     */
    allowExpressions(
      parsed,
      componentNameAllowedExpressions.concat(expressions.SequenceExpression),
      parser.options.filename,
      `{${token.properties.jsArg}} is not a valid argument type for the @component tag`,
    )

    /**
     * Pulling the name and props for the component. The underlying method will
     * ensure that the arguments passed to component tag are valid
     */
    const [name, props] = getComponentNameAndProps(parsed, parser)

    /**
     * Loop over all the children and set them as part of slots. If no slot
     * is defined, then the content will be part of the main slot
     */
    const slots = {}
    token.children.forEach((child, index) => {
      let slotName: string = `'main'`
      let slotProps: string | null = null

      /**
       * Update the slot name and props when a new slot is detected
       */
      if (isBlock(child, 'slot')) {
        [slotName, slotProps] = getSlotNameAndProps(child, parser)
      }

      /**
       * Create a new slot with buffer to process the childs
       */
      if (!slots[slotName]) {
        slots[slotName] = { buffer: new EdgeBuffer(`slot_${index}`), props: slotProps }

        /**
         * Only start the frame, when there are props in use for a given slot.
         */
        if (slotProps) {
          slots[slotName].buffer.writeStatement('ctx.newFrame()')
          slots[slotName].buffer.writeStatement(`ctx.setOnFrame('${slotProps}', ${slotProps})`)
        }
      }

      /**
       * We must process slot of a component by ourselves (instead of making slot tag)
       * process it. This way, we can disallow slots appearing outside the component
       * tag
       */
      if (isBlock(child, 'slot')) {
        child.children.forEach((token) => parser.processToken(token, slots[slotName].buffer))
      } else {
        parser.processToken(child, slots[slotName].buffer)
      }
    })

    /**
     * We convert the slots to an objectified string, that is passed to `template.renderWithState`,
     * which will pass it to the component as it's local state.
     */
    const obj = new StringifiedObject()
    Object.keys(slots).forEach((slot) => {
      /**
       * Cleanup the previously started frame scope
       */
      if (slots[slot].props) {
        slots[slot].buffer.writeStatement('ctx.removeFrame()')
      }

      const fnCall = slots[slot].props ? `return function (${slots[slot].props}) {` : 'return function () {'
      slots[slot].buffer.wrap(fnCall, '}')
      obj.add(slot, slots[slot].buffer.flush(true))
    })

    /**
     * Write the line to render the component with it's own state
     */
    buffer.writeLine(`template.renderWithState(${name}, ${props}, ${obj.flush()})`)
  },
}
