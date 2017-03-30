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
     * Show the actual section content when section content is missing
     * or @super tag was used.
     */
    buffer.writeLine(`if (!this.context.hasSection(${slotName}) || this.context.inheritSection(${slotName})) {`)
    buffer.indent()

    /**
     * Process all the childs within the section tag
     */
    childs.forEach((child) => compiler.parseLine(child))

    /**
     * Closing the if statement
     */
    buffer.dedent()
    buffer.writeLine('}')

    /**
     * If section was overrided, show the overriden content
     */
    buffer.writeLine(`if (this.context.hasSection(${slotName})) {`)
    buffer.indent()

    /**
     * Write the sections content when section does exists.
     */
    buffer.writeToOutput(`\${this.context.outPutSection(${slotName})}`)

    /**
     * Closing if tag
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
      return this.sections[name] && typeof (this.sections[name].content) !== 'undefined'
    })

    context.macro('inheritSection', function (name) {
      return this.sections[name] && this.sections[name].inheritParent
    })

    context.macro('outPutSection', function (name) {
      return this.sections[name].content
    })
  }
}

module.exports = SectionTag
