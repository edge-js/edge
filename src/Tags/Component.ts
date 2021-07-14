/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EdgeError } from 'edge-error'
import { TagToken, utils as lexerUtils } from 'edge-lexer'
import { EdgeBuffer, expressions, Parser } from 'edge-parser'

import { TagContract } from '../Contracts'
import { StringifiedObject } from '../StringifiedObject'
import { isSubsetOf, unallowedExpression, parseJsArg } from '../utils'

/**
 * A list of allowed expressions for the component name
 */
const ALLOWED_EXPRESSION_FOR_COMPONENT_NAME = [
  expressions.Identifier,
  expressions.Literal,
  expressions.LogicalExpression,
  expressions.MemberExpression,
  expressions.ConditionalExpression,
  expressions.CallExpression,
  expressions.TemplateLiteral,
] as const

/**
 * Shape of a slot
 */
type Slot = {
  outputVar: string
  props: any
  buffer: EdgeBuffer
  line: number
  filename: string
}

/**
 * Returns the component name and props by parsing the component jsArg expression
 */
function getComponentNameAndProps(
  expression: any,
  parser: Parser,
  filename: string
): [string, string] {
  let name: string

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
  isSubsetOf(name, ALLOWED_EXPRESSION_FOR_COMPONENT_NAME, () => {
    unallowedExpression(
      `"${parser.utils.stringify(name)}" is not a valid argument for component name`,
      filename,
      parser.utils.getExpressionLoc(name)
    )
  })

  /**
   * Parse rest of sequence expressions as an objectified string.
   */
  if (expression.type === expressions.SequenceExpression) {
    /**
     * We only need to entertain the first expression of the sequence
     * expression, as components allows a max of two arguments
     */
    const firstSequenceExpression = expression.expressions[0]

    if (
      firstSequenceExpression &&
      [expressions.ObjectExpression, expressions.AssignmentExpression].includes(
        firstSequenceExpression.type
      )
    ) {
      return [
        parser.utils.stringify(name),
        StringifiedObject.fromAcornExpressions([firstSequenceExpression], parser),
      ]
    }

    return [parser.utils.stringify(name), parser.utils.stringify(firstSequenceExpression)]
  }

  /**
   * When top level expression is not a sequence expression, then we assume props
   * as empty stringified object.
   */
  return [parser.utils.stringify(name), '{}']
}

/**
 * Parses the slot component to fetch it's name and props
 */
function getSlotNameAndProps(token: TagToken, parser: Parser): [string, null | string] {
  /**
   * We just generate the acorn AST only, since we don't want parser to transform
   * ast to edge statements for a `@slot` tag.
   */
  const parsed = parser.utils.generateAST(
    token.properties.jsArg,
    token.loc,
    token.filename
  ).expression

  isSubsetOf(parsed, [expressions.Literal, expressions.SequenceExpression], () => {
    unallowedExpression(
      `"${token.properties.jsArg}" is not a valid argument type for the @slot tag`,
      token.filename,
      parser.utils.getExpressionLoc(parsed)
    )
  })

  /**
   * Fetch the slot name
   */
  let name: any
  if (parsed.type === expressions.SequenceExpression) {
    name = parsed.expressions[0]
  } else {
    name = parsed
  }

  /**
   * Validating the slot name to be a literal value, since slot names cannot be dynamic
   */
  isSubsetOf(name, [expressions.Literal], () => {
    unallowedExpression(
      'slot name must be a valid string literal',
      token.filename,
      parser.utils.getExpressionLoc(name)
    )
  })

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
      filename: token.filename,
    })
  }

  isSubsetOf(parsed.expressions[1], [expressions.Identifier], () => {
    unallowedExpression(
      `"${parser.utils.stringify(
        parsed.expressions[1]
      )}" is not valid prop identifier for @slot tag`,
      token.filename,
      parser.utils.getExpressionLoc(parsed.expressions[1])
    )
  })

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

  compile(parser, buffer, token) {
    const asyncKeyword = parser.asyncMode ? 'async ' : ''
    const awaitKeyword = parser.asyncMode ? 'await ' : ''
    const parsed = parseJsArg(parser, token)

    /**
     * Check component jsProps for allowed expressions
     */
    isSubsetOf(
      parsed,
      ALLOWED_EXPRESSION_FOR_COMPONENT_NAME.concat(expressions.SequenceExpression as any),
      () => {
        unallowedExpression(
          `"${token.properties.jsArg}" is not a valid argument type for the @component tag`,
          token.filename,
          parser.utils.getExpressionLoc(parsed)
        )
      }
    )

    /**
     * Pulling the name and props for the component. The underlying method will
     * ensure that the arguments passed to component tag are valid
     */
    const [name, props] = getComponentNameAndProps(parsed, parser, token.filename)

    /**
     * Loop over all the children and set them as part of slots. If no slot
     * is defined, then the content will be part of the main slot
     */
    const slots: { [slotName: string]: Slot } = {}

    /**
     * Main slot collects everything that is out of the named slots
     * inside a component
     */
    const mainSlot: Slot = {
      outputVar: 'slot_main',
      props: {},
      buffer: buffer.create(token.filename, {
        outputVar: 'slot_main',
      }),
      line: -1,
      filename: token.filename,
    }

    let slotsCounter = 0

    /**
     * Loop over all the component children
     */
    token.children.forEach((child) => {
      /**
       * If children is not a slot, then add it to the main slot
       */
      if (!lexerUtils.isTag(child, 'slot')) {
        /**
         * Ignore first newline inside the unnamed main slot
         */
        if (mainSlot.buffer.size === 0 && child.type === 'newline') {
          return
        }
        parser.processToken(child, mainSlot.buffer)
        return
      }

      /**
       * Fetch slot and props
       */
      const [slotName, slotProps] = getSlotNameAndProps(child, parser)
      slotsCounter++

      /**
       * Create a new slot with buffer to process the children
       */
      if (!slots[slotName]) {
        /**
         * Slot buffer points to the component file name, since slots doesn't
         * have their own file names.
         */
        slots[slotName] = {
          outputVar: `slot_${slotsCounter}`,
          buffer: buffer.create(token.filename, {
            outputVar: `slot_${slotsCounter}`,
          }),
          props: slotProps,
          line: -1,
          filename: token.filename,
        }

        /**
         * Only start the frame, when there are props in use for a given slot.
         */
        if (slotProps) {
          parser.stack.defineScope()
          parser.stack.defineVariable(slotProps)
        }
      }

      /**
       * Self process the slot children.
       */
      child.children.forEach((grandChildren) => {
        parser.processToken(grandChildren, slots[slotName].buffer)
      })

      /**
       * Close the frame after process the slot children
       */
      if (slotProps) {
        parser.stack.clearScope()
      }
    })

    const obj = new StringifiedObject()

    /**
     * Creating a shallow copy of context for the component slots and its children
     */
    obj.add('$context', 'Object.assign({}, $context)')

    /**
     * Add main slot to the stringified object, when main slot
     * is not defined otherwise.
     */
    if (!slots['main']) {
      if (mainSlot.buffer.size) {
        mainSlot.buffer.wrap(`${asyncKeyword}function () { const $context = this.$context;`, '}')
        obj.add('main', mainSlot.buffer.disableFileAndLineVariables().flush())
      } else {
        obj.add('main', 'function () { return "" }')
      }
    }

    /**
     * We convert the slots to an objectified string, that is passed to `template.renderWithState`,
     * which will pass it to the component as it's local state.
     */
    Object.keys(slots).forEach((slotName) => {
      if (slots[slotName].buffer.size) {
        const fnCall = slots[slotName].props
          ? `${asyncKeyword}function (${slots[slotName].props}) { const $context = this.$context;`
          : `${asyncKeyword}function () { const $context = this.$context;`
        slots[slotName].buffer.wrap(fnCall, '}')

        obj.add(slotName, slots[slotName].buffer.disableFileAndLineVariables().flush())
      } else {
        obj.add(slotName, 'function () { return "" }')
      }
    })

    const caller = new StringifiedObject()
    caller.add('filename', '$filename')
    caller.add('line', '$lineNumber')
    caller.add('col', 0)

    /**
     * Write the line to render the component with it's own state
     */
    buffer.outputExpression(
      `${awaitKeyword}template.compileComponent(${name})(template, template.getComponentState(${props}, ${obj.flush()}, ${caller.flush()}), $context)`,
      token.filename,
      token.loc.start.line,
      false
    )
  },
}
