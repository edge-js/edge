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

/**
 * The debugger tag for runtime debugging
 * inside chrome dev tools.
 *
 * @class DebuggerTag
 * @extends {BaseTag}
 * @static
 */
class DebuggerTag extends BaseTag {
  /**
   * Tag name to be used for registering
   * the tag
   *
   * @method tagName
   *
   * @return {String}
   */
  get tagName () {
    return 'debugger'
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
    buffer.writeLine('debugger')
  }

  /**
   * Nothing needs to be done in runtime
   * for debugger tag
   */
  run () {
  }
}

module.exports = DebuggerTag
