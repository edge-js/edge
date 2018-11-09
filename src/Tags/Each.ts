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
import { ITagToken } from 'edge-lexer/build/src/Contracts'
import { each, size as lodashSize } from 'lodash'
import { allowExpressions, isBlock } from '../utils'

export class EachTag {
  public static block = true
  public static seekable = true
  public static selfclosed = true
  public static tagName = 'each'

  private static allowedExpressions = ['BinaryExpression']

  /**
   * Returns the value and key names for the foreach loop
   */
  private static _getLoopKeyValue (expression: any, filename: string): [string, string] {
    allowExpressions('each', expression, ['SequenceExpression', 'Identifier'], filename)

    if (expression.type === 'SequenceExpression') {
      return [expression.expressions[0].name, expression.expressions[1].name]
    }

    return [expression.name, 'key']
  }

  /**
   * Returns the source on which we should execute the loop
   */
  private static _getLoopSource (expression: any, parser: Parser): string {
    return parser.statementToString(parser.acornToEdgeExpression(expression))
  }

  /**
   * Compiles else block node to Javascript else statement
   */
  public static compile (parser: Parser, buffer: EdgeBuffer, token: ITagToken) {
    const ast = parser.generateAst(token.properties.jsArg, token.loc)
    const expression = ast.body[0].expression

    allowExpressions('each', expression, this.allowedExpressions, parser.options.filename)

    const [value, key] = this._getLoopKeyValue(expression.left, parser.options.filename)
    const rhs = this._getLoopSource(expression.right, parser)

    const elseIndex = token
      .children
      .findIndex((child) => {
        return isBlock(child, 'else')
      })
    const elseChild = elseIndex > -1 ? token.children.splice(elseIndex) : []

    /**
     * If there is an else statement, then wrap the loop
     * inside the `if` statement first
     */
    if (elseIndex > -1) {
      buffer.writeStatement(`if(ctx.size(${rhs})) {`)
      buffer.indent()
    }

    /**
     * Write the loop statement to the template
     */
    buffer.writeStatement(`ctx.loop(${rhs}, function (${value}, loop) {`)

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
    buffer.writeStatement(`ctx.setOnFrame('${value}', ${value})`)
    buffer.writeStatement(`ctx.setOnFrame('$loop', loop)`)
    buffer.writeStatement(`ctx.setOnFrame('${key}', loop.key)`)

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
  }

  /**
   * Add methods to the runtime context for running the loop
   */
  public static run (context) {
    context.macro('loop', function loop (source, callback) {
      let index = 0
      const total = lodashSize(source)

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

    context.macro('size', function size (source) {
      return lodashSize(source)
    })
  }
}
