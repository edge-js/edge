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
 * The official section tag. It is used
 * as `@section` inside templates.
 *
 * @class SectionTag
 * @extends {BaseTag}
 * @static
 */
class SectionTag extends BaseTag {
  /**
   * The tagname to be used for registering
   * the tag
   *
   * @attribute tagName
   *
   * @return {String}
   */
  get tagName () {
    return 'section'
  }

  /**
   * Whether or not the tag is a block
   * tag.
   *
   * @attribute isBlock
   *
   * @return {Boolean}
   */
  get isBlock () {
    return true
  }

  /**
   * The expressions allowed to be passed to a section.
   *
   * @attribute allowedExpressions
   *
   * @return {Array}
   */
  get allowedExpressions () {
    return ['Literal']
  }

  /**
   * Compiles the sections body
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
    const slotName = this._compileStatement(lexer, body, lineno).toStatement()

    /**
     * Write an if block checking where the actual content of
     * the section exists or not.
     */
    buffer.writeLine(`if (this.context.hasSection(${slotName})) {`)
    buffer.indent()

    /**
     * Write the sections content when section does exists.
     */
    buffer.writeToOutput(`\${this.context.outPutSection(${slotName})}`)

    /**
     * Closing if and starting else
     */
    buffer.dedent()
    buffer.writeLine('} else { ')
    buffer.indent()

    /**
     * Process all the childs when section content does
     * not exists.
     */
    childs.forEach((child) => compiler.parseLine(child))

    /**
     * Close else
     */
    buffer.dedent()
    buffer.writeLine('}')
  }

  /**
   * Nothing needs to be in done in runtime for
   * a slot tag.
   *
   * @method run
   */
  run (context) {
    context.macro('hasSection', function (name) {
      return !!this.sections[name]
    })

    context.macro('outPutSection', function (name) {
      return this.sections[name]
    })
  }
}

module.exports = SectionTag
