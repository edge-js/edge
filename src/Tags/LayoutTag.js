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
const CE = require('../Exceptions')
const layoutRegex = /^\s*@layout(?:\((.*)\))?/

/**
 * The official layout tag. It is used
 * as `@layout` inside templates.
 *
 * ## Note
 * This is a special tag which is not called if
 * first line of the template is not making
 * use of `@layout` block.
 *
 * @class LayoutTag
 * @extends {BaseTag}
 * @static
 */
class LayoutTag extends BaseTag {
  /**
   * The expressions allowed inside an if tag.
   *
   * @method allowedExpressions
   *
   * @return {Array}
   */
  get allowedExpressions () {
    return ['Literal', 'Identifier', 'MemberExpression']
  }

  /**
   * Returns the section name for a given section.
   * Also validates the name to be a valid literal
   *
   * @method _getSectionName
   *
   * @param  {Object}        lexer
   * @param  {String}        body
   * @param  {Number}        lineno
   *
   * @return {String}
   *
   * @private
   */
  _getSectionName (lexer, body, lineno) {
    try {
      return lexer.parseRaw(body, ['Literal']).toStatement()
    } catch (error) {
      const message = `Invalid expression <${body}> passed to a section. Make sure section name must be a valid string`
      throw CE.InvalidExpressionException.generic(message, lineno, '0')
    }
  }

  /**
   * Processes all sections inside a loop and set their
   * processed content on the context.
   *
   * @method _processSections
   *
   * @param  {Object}         compiler
   * @param  {Object}         lexer
   * @param  {Object}         buffer
   * @param  {Array}          ast
   * @param  {Number}         lineno
   *
   * @return {void}
   *
   * @private
   */
  _processSections (compiler, lexer, buffer, ast, lineno) {
    let progressiveLineNo = lineno
    const processedSections = []

    ast.forEach(({ tag, body, args, childs }) => {
      /**
       * Increment the line number for each line
       */
      progressiveLineNo++

      /**
       * If line is not a tag, do not process it, sence with
       * layouts all content needs to be within sections.
       */
      if (!tag) {
        return
      }

      const sectionName = this._getSectionName(lexer, args, progressiveLineNo)

      /**
       * Throw exception when section has already been called.
       * Since we cannot have multiple section blocks for
       * a single name.
       */
      if (processedSections.indexOf(sectionName) > -1) {
        const message = `Section <${body}> has been called multiple times. A section can only be called once.`
        throw CE.InvalidExpressionException.generic(message, progressiveLineNo, 0)
      }

      /**
       * Increase the line number for each child in.
       */
      progressiveLineNo = progressiveLineNo + childs.length

      /**
       * Push section name to the list of processed
       * sections.
       */
      processedSections.push(sectionName)

      /**
       * Find whether or not to inherit the default
       * section.
       */
      let inheritParent = false
      if (childs.length && ['@super', '@super()'].indexOf(childs[0].body.trim()) > -1) {
        childs.shift()
        inheritParent = true
      }

      const sectionOutput = childs.map((child) => compiler.parseAndReturnLine(child)).join('\n')

      /**
       * Store the output of section inside a key on the
       * context sections object.
       */
      buffer.writeLine(`this.context.sections[${sectionName}] = {inheritParent: ${inheritParent}, content: \`${sectionOutput}\`}`)

      /**
       * ++ the line no for the `endsection` tag
       */
      progressiveLineNo++
    })
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
   * @param  {Number} options.lineno
   *
   * @return {void}
   */
  compile (compiler, lexer, buffer, { body, lineno }, ast) {
    const [, layoutName] = layoutRegex.exec(body) || []
    const layout = this._compileStatement(lexer, layoutName, lineno).toStatement()

    /**
     * Create an object of sections on the context.
     *
     * @type {Object}
     */
    buffer.writeLine('this.context.sections = {}')

    /**
     * Process all the sections inside AST.
     */
    this._processSections(compiler, lexer, buffer, ast, lineno)

    /**
     * Now render the layout in runtime.
     */
    buffer.writeToOutput(`$\{${lexer.runTimeRenderFn}(${layout})}`, false)
  }

  /**
   * Nothing needs to be done in runtime
   * for an include tag
   */
  run () {
  }
}

module.exports = LayoutTag
