'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const BaseTag = require('./BaseTag')
const _ = require('lodash')
const CE = require('../Exceptions')

/**
 * The official each tag. It is used
 * as `@each` inside templates.
 *
 * @class EachTag
 * @extends {BaseTag}
 * @static
 */
class EachTag extends BaseTag {
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
   * The expressions allowed to be passed to the
   * tag. Any other expressions will cause an
   * error.
   *
   * @method allowedExpressions
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
   * @param  {Object} compiler
   * @param  {Object} lexer
   * @param  {Object} buffer
   * @param  {String} options.body
   * @param  {Array} options.childs
   * @param  {Number} options.lineno
   *
   * @return {void}
   */
  compile (compiler, lexer, buffer, { body, childs, lineno }) {
    const compiledStatement = this._compileStatement(lexer, body, lineno)

    /**
     * Throw exception when invalid operator is used.
     */
    if (compiledStatement.tokens.operator !== 'in') {
      const message = `Invalid operator <${compiledStatement.tokens.operator}> used inside an each block. Make sure to use <in> operator`
      throw CE.InvalidExpressionException.generic(message, lineno, 0)
    }

    const lhs = compiledStatement.tokens.lhs
    const rhs = compiledStatement.rhsStatement()

    /**
     * Throw exception when invalid expression passed
     * inside an each block.
     */
    if (!_.includes(['source', 'sequence'], lhs.type)) {
      const message = `Invalid left hand side expression <${body}> used inside an each block.`
      throw CE.InvalidExpressionException.generic(message, lineno, 0)
    }

    /**
     * If lhs.type is sequence then we need to pull the itteratorName
     * and itteratorKey from the sequence expresssion itself.
     *
     * @example
     * (user, index) from users
     */
    const itteratorName = lhs.type === 'sequence' ? lhs.tokens.members[0].value : lhs.value
    const itteratorKey = lhs.type === 'sequence' ? lhs.tokens.members[1].value : ''

    /**
     * If there is an else block, we need to find the childs
     * before the else tag and close the each block, before
     * else beings. Also we need to wrap each inside an
     * if block.
     */
    const elseIndex = _.findIndex(childs, (child) => child.tag === 'else')
    const hasElse = elseIndex > -1
    const elseChilds = hasElse ? childs.splice(elseIndex) : childs

    /**
     * Wrap each inside if block when child
     * has a else tag
     */
    if (hasElse) {
      buffer.writeLine(`if (this.context.hasLength(${rhs})) {`)
      buffer.indent()
    }

    const varName = compiler.runtimeVariable('payload')
    buffer.writeLine(`const ${varName} = ${rhs}`)

    /**
     * Create a new frame before running the
     * each loop.
     */
    buffer.writeLine(`${lexer.newFrameFn}()`)

    /**
     * Write the actual each loop
     */
    buffer.writeLine(`this.context.loop(${varName}, (${itteratorName}, loop) => {`)
    buffer.indent()

    /**
     * Sets some values on the frame to be accessed
     * on runtime
     */
    buffer.writeLine(`${lexer.setOnFrameFn}('${itteratorName}', ${itteratorName})`)
    buffer.writeLine(`${lexer.setOnFrameFn}('$loop', loop)`)

    /**
     * Set the itterator key when defined
     */
    if (itteratorKey) {
      buffer.writeLine(`${lexer.setOnFrameFn}('${itteratorKey}', loop.key)`)
    }

    /**
     * Parse all childs
     */
    childs.forEach((child) => compiler.parseLine(child))

    /**
     * Close the each loop
     */
    buffer.dedent()
    buffer.writeLine('})')

    /**
     * Clear the frame after the each loop is completed
     */
    buffer.writeLine(`${lexer.clearFrameFn}()`)

    /**
     * Parse childs within else tag defined
     * within each tag and then close the
     * opened if tag.
     */
    if (hasElse) {
      elseChilds.forEach((child) => compiler.parseLine(child))
      buffer.dedent()
      buffer.writeLine('}')
    }
  }

  /**
   * Adds the macro to the runtime context to run
   * the loop.
   *
   * @method run
   *
   * @param  {Object} context
   */
  run (context) {
    context.macro('loop', function (data, callback) {
      let index = 0
      const total = _.size(data)
      _.each(data, (item, key) => {
        callback(item, {
          key: key,
          index: index,
          first: index === 0,
          last: (index + 1 === total),
          total: total
        })
        index++
      })
    })

    context.macro('hasLength', function (data) {
      return _.size(data)
    })
  }
}

module.exports = EachTag
