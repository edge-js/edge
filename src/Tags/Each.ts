/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { utils as lexerUtils } from 'edge-lexer'
import { Parser, expressions } from 'edge-parser'
import { each, size } from 'lodash'

import { TagContract } from '../Contracts'
import { isSubsetOf, unallowedExpression } from '../utils'

/**
 * Returns the list to loop over for the each expression
 */
function getLoopList (expression: any, parser: Parser, filename: string): string {
  return parser.utils.stringify(parser.utils.transformAst(expression, filename))
}

/**
 * Returns loop item and the index for the each expression
 */
function getLoopItemAndIndex (expression: any, filename: string): [string, string] {
  isSubsetOf(
    expression,
    [expressions.SequenceExpression, expressions.Identifier],
    () => {
      unallowedExpression(
        `invalid left hand side "${expression.type}" for the @each tag`,
        expression,
        filename,
      )
    },
  )

  /**
   * Return list index from the sequence expression
   */
  if (expression.type === 'SequenceExpression') {
    isSubsetOf(
      expression.expressions[0],
      [expressions.Identifier],
      () => {
        unallowedExpression(
          `"${expression.expressions[0]}.type" is not allowed as value identifier for @each tag`,
          expression.expressions[0],
          filename,
        )
      },
    )

    isSubsetOf(
      expression.expressions[1],
      [expressions.Identifier],
      () => {
        unallowedExpression(
          `"${expression.expressions[1]}.type" is not allowed as key identifier for @each tag`,
          expression.expressions[1],
          filename,
        )
      },
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
     * We just generate the AST and do not transform it, since the transform
     * function attempts to resolve identifiers
     */
    const parsed = parser.utils.generateAST(
      token.properties.jsArg,
      token.loc,
      token.filename,
    ).expression

    isSubsetOf(
      parsed,
      [expressions.BinaryExpression],
      () => {
        unallowedExpression(
          `"${token.properties.jsArg}" is not a valid binary expression for the @each tag`,
          parsed,
          token.filename,
        )
      },
    )

    /**
     * Finding if an else child exists inside the each tag
     */
    const elseIndex = token.children.findIndex((child) => lexerUtils.isTag(child, 'else'))
    const elseChild = elseIndex > -1 ? token.children.splice(elseIndex) : []

    /**
     * Fetching the item,index and list for the each loop
     */
    const [item, index] = getLoopItemAndIndex(parsed.left, token.filename)
    const list = getLoopList(parsed.right, parser, token.filename)

    /**
     * If there is an else statement, then wrap the loop
     * inside the `if` statement first
     */
    if (elseIndex > -1) {
      buffer.writeStatement(`if(ctx.size(${list})) {`, token.filename, token.loc.start.line)
    }

    /**
     * Write the loop statement to the template
     */
    buffer.writeStatement(`ctx.loop(${list}, function (${item}, loop) {`, token.filename, token.loc.start.line)

    /**
     * Start a new context frame. Frame ensures the value inside
     * the loop is given priority over top level values. Think
     * of it as a Javascript block scope.
     */
    buffer.writeExpression('ctx.newFrame()', token.filename, -1)

    /**
     * Set key and value pair on the context
     */
    buffer.writeExpression(`ctx.setOnFrame('${item}', ${item})`, token.filename, -1)
    buffer.writeExpression('ctx.setOnFrame(\'$loop\', loop)', token.filename, -1)
    buffer.writeExpression(`ctx.setOnFrame('${index}', loop.key)`, token.filename, -1)

    /**
     * Process all kids
     */
    token.children.forEach((child) => parser.processToken(child, buffer))

    /**
     * Remove the frame
     */
    buffer.writeExpression('ctx.removeFrame()', token.filename, -1)

    /**
     * Close each loop
     */
    buffer.writeExpression('})', token.filename, -1)

    /**
     * If there is an else statement, then process
     * else childs and close the if block
     */
    if (elseIndex > -1) {
      elseChild.forEach((child) => parser.processToken(child, buffer))
      buffer.writeStatement('}', token.filename, -1)
    }
  },

  /**
   * Add methods to the runtime context for running the loop
   */
  run (context) {
    context.macro('loop', function loop (source, callback) {
      let index = 0
      const total = size(source)

      each(source, (value: any, key: any) => {
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
