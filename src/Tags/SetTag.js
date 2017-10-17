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

/**
 * The `set` tag allows you to mutate data
 * object for a given template.
 *
 * @class SetTag
 * @extends {BaseTag}
 * @static
 */
class SetTag extends BaseTag {
  /**
   * Tag name to be used for registering
   * the tag
   *
   * @method tagName
   *
   * @return {String}
   */
  get tagName () {
    return 'set'
  }

  /**
   * Whether or not the tag is block level
   * tag. Which is no in this case.
   *
   * @method isBlock
   *
   * @return {Boolean}
   */
  get isBlock () {
    return false
  }

  /**
   * The expressions allowed inside an if tag.
   *
   * @method allowedExpressions
   *
   * @return {Array}
   */
  get allowedExpressions () {
    return ['SequenceExpression']
  }

  /**
   * Compile the template
   *
   * @method compile
   *
   * @param  {Object} compiler
   * @param  {Object} lexer
   * @param  {Object} buffer
   * @param  {String} options.body
   * @param  {Array}  options.childs
   * @param  {Number} options.lineno
   *
   * @return {void}
   */
  compile (compiler, lexer, buffer, { body, childs, lineno }) {
    const [lhs, rhs] = this._compileStatement(lexer, body, lineno).toStatement()
    buffer.writeLine(`this.context.setValue(${lhs}, ${rhs})`)
  }

  /**
   * Nothing needs to be done in runtime
   * for an include tag
   */
  run (Context) {
    Context.macro('setValue', function (key, value) {
      _.set(this.$presenter.$data, key, value)
    })
  }
}

module.exports = SetTag
