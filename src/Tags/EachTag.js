'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')

class EachTag {
  /**
   * The tag name
   *
   * @attribute tagName
   *
   * @return {String}
   */
  get tagName () {
    return 'each'
  }

  /**
   * Whether or not tag is a block tag
   *
   * @attribute isBlock
   *
   * @return {Boolean}
   */
  get isBlock () {
    return true
  }

  /**
   * The allowed expressions
   *
   * @attribute allowedExpressions
   *
   * @return {Array}
   */
  get allowedExpressions () {
    return ['BinaryExpression']
  }

  /**
   * Compile the each block
   *
   * @method compile
   *
   * @param  {Object} parser
   * @param  {Object} lexer
   * @param  {Object} buffer
   * @param  {String} options.body
   * @param  {Array} options.childs
   * @param  {Number} options.lineno
   *
   * @return {void}
   */
  compile (parser, lexer, buffer, { body, childs, lineno }) {
    /**
     * Compile the statement to expression instance. Also throw an exception
     * when expression is not in allowed expressions.
     */
    const compiledStatement = lexer.parseRaw(body, this.allowedExpressions)

    /**
     * Throw exception when invalid operator is used.
     */
    if (compiledStatement.tokens.operator !== 'in') {
      throw new Error(`lineno: ${lineno} Invalid operator <${compiledStatement.tokens.operator}> used inside an each block. Make sure to use <in> operator`)
    }

    const itteratorName = compiledStatement.tokens.lhs.value

    /**
     * Create a new frame before running the
     * each loop.
     */
    buffer.writeLine(`${lexer.newFrameFn}()`)

    /**
     * Write the actual each loop processor
     */
    buffer.writeLine(`this.loop(${compiledStatement.rhsStatement()}, (${itteratorName}, loop) => {`)
    buffer.indent()

    /**
     * Sets some values on the frame to be accessed
     * on runtime
     */
    buffer.writeLine(`${lexer.setOnFrameFn}('${itteratorName}', ${itteratorName})`)
    buffer.writeLine(`${lexer.setOnFrameFn}('$loop', loop)`)

    /**
     * Parse all childs
     */
    childs.forEach(parser.parseLine.bind(parser))

    /**
     * Close the each loop
     */
    buffer.dedent()
    buffer.writeLine('})')

    /**
     * Clear the frame after the each loop is completed
     */
    buffer.writeLine(`${lexer.clearFrameFn}()`)
  }

  /**
   * Adds the macro to the runtime context
   *
   * @method run
   *
   * @param  {Object} context
   */
  run (context) {
    context.macro('loop', function (data, callback) {
      _.each(data, (item, index) => {
        callback(item, {
          index: index,
          total: _.size(data)
        })
      })
    })
  }
}

module.exports = new EachTag()
