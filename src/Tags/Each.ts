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

import { Parser, expressions } from 'edge-parser'
import { each, size } from 'lodash'

import { TagContract } from '../Contracts'
import { allowExpressions, isBlock } from '../utils'

/**
 * Returns the list to loop over for the each expression
 */
function getLoopList (expression: any, parser: Parser): string {
  return parser.statementToString(parser.acornToEdgeExpression(expression))
}

/**
 * Returns loop item and the index for the each expression
 */
function getLoopItemAndIndex (expression: any, filename: string): [string, string] {
  allowExpressions(
    expression,
    [expressions.SequenceExpression, expressions.Identifier],
    filename,
    `invalid left hand side expression for the @each tag`,
  )

  /**
   * Return list index from the sequence expression
   */
  if (expression.type === 'SequenceExpression') {
    allowExpressions(
      expression.expressions[0],
      [expressions.Identifier],
      filename,
      `invalid expression for {value} identifier for the @each tag`,
    )

    allowExpressions(
      expression.expressions[1],
      [expressions.SequenceExpression, expressions.Identifier],
      filename,
      `invalid expression for {key} identifier for the @each tag`,
    )
    return [expression.expressions[0].name, expression.expressions[1].name]
  }

  return [expression.name, 'key']
}

/**
 * Each tag is used to run a foreach loop on arrays and even objects.
 *
 * ```edge
 * @each(user in users)
 *   {{ user }} {{ $loop.index }}
 * @endeach
 * ```
 */
export const eachTag: TagContract = {
  block: true,
  seekable: true,
  tagName: 'each',

  /**
   * Compile the template
   */
  compile (parser, buffer, token) {
    /**
     * Instead of using `parser.parseJsString`, we make use of `generateAst`, since
     * we do not want to process `Indentifer` expressions as per the normal
     * parsing logic and just want to extract their names.
     */
    const parsed = parser.generateAst(token.properties.jsArg, token.loc).body[0].expression
    allowExpressions(
      parsed,
      [expressions.BinaryExpression],
      parser.options.filename,
      `{${token.properties.jsArg}} is not a valid binary expression for the @each tag`,
    )

    /**
     * Finding if an else child exists inside the each tag
     */
    const elseIndex = token.children.findIndex((child) => isBlock(child, 'else'))
    const elseChild = elseIndex > -1 ? token.children.splice(elseIndex) : []

    /**
     * Fetching the item,index and list for the each loop
     */
    const [item, index] = getLoopItemAndIndex(parsed.left, parser.options.filename)
    const list = getLoopList(parsed.right, parser)

    /**
     * If there is an else statement, then wrap the loop
     * inside the `if` statement first
     */
    if (elseIndex > -1) {
      buffer.writeStatement(`if(ctx.size(${list})) {`)
      buffer.indent()
    }

    /**
     * Write the loop statement to the template
     */
    buffer.writeStatement(`ctx.loop(${list}, function (${item}, loop) {`)

    /**
     * Indent block
     */
    buffer.indent()

    /**
     * Start a new context frame. Frame ensures the value inside
     * the loop is given priority over top level values. Think
     * of it as a Javascript block scope.
     */
    buffer.writeStatement('ctx.newFrame()')

    /**
     * Set key and value pair on the context
     */
    buffer.writeStatement(`ctx.setOnFrame('${item}', ${item})`)
    buffer.writeStatement(`ctx.setOnFrame('$loop', loop)`)
    buffer.writeStatement(`ctx.setOnFrame('${index}', loop.key)`)

    /**
     * Process all kids
     */
    token.children.forEach((child) => {
      parser.processToken(child, buffer)
    })

    /**
     * Remove the frame
     */
    buffer.writeStatement('ctx.removeFrame()')

    /**
     * Dedent block
     */
    buffer.dedent()

    /**
     * Close each loop
     */
    buffer.writeStatement('})')

    /**
     * If there is an else statement, then process
     * else childs and close the if block
     */
    if (elseIndex > -1) {
      elseChild.forEach((child) => parser.processToken(child, buffer))
      buffer.dedent()
      buffer.writeStatement(`}`)
    }
  },

  /**
   * Add methods to the runtime context for running the loop
   */
  run (context) {
    context.macro('loop', function loop (source, callback) {
      let index = 0
      const total = size(source)

      each(source, (value, key) => {
        const isEven = (index + 1) % 2 === 0

        callback(value, {
          key: key,
          index: index,
          first: index === 0,
          isOdd: !isEven,
          isEven: isEven,
          last: (index + 1 === total),
          total: total,
        })

        index++
      })
    })

    context.macro('size', size)
  },
}
