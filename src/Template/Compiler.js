'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const debug = require('debug')('edge:compiler')
const lexer = new (require('../Lexer'))(true)
const InternalBuffer = require('../Buffer')
const CE = require('../Exceptions')
const Ast = require('../Ast')

/**
 * Static expression. They never change
 */
const expressions = {
  interpolate: /(@)?{{({)?\s+(.+?)\s+(})?}}/g
}

/**
 * Template compiler compiles a template into a
 * Javascript executable string.
 *
 * @class TemplateCompiler
 * @constructor
 */
class TemplateCompiler {
  constructor (tags, loader, asFunction = false) {
    this._tags = tags
    this._processedLines = {}
    this._loader = loader
    this.buffer = new InternalBuffer(asFunction)
    this._runtimeVarIndex = 0
  }

  /**
   * Parse a line with a tag. Output should be
   * written to buffer by the implemented tag.
   *
   * @method _parseTagLine
   *
   * @param  {Object}      line
   * @param  {Boolean}     writeToBuffer
   *
   * @return {void}
   *
   * @private
   */
  _parseTagLine (line, writeToBuffer) {
    const buffer = writeToBuffer ? this.buffer : new InternalBuffer(true)
    this._tags[line.tag].compile(this, lexer, buffer, {
      body: line.args,
      childs: line.childs,
      lineno: line.lineno
    })

    /**
     * Return the buffer lines when write to
     * buffer is not set to true.
     */
    if (!writeToBuffer) {
      return `\${${buffer.getLines().replace(/^return/, '')}}`
    }
  }

  /**
   * Parse raw line by doing a regex replace. Here we
   * write to the buffer output.
   *
   * @method _parseRawLine
   *
   * @param  {Object}      line
   *
   * @return {void}
   *
   * @private
   */
  _parseRawLine ({ body, lineno }, writeToBuffer) {
    /**
     * If line has already been processed, use it from
     * cache.
     */
    if (this._processedLines[body]) {
      if (writeToBuffer) {
        this.buffer.writeToOutput(`${this._processedLines[body]}`)
      }
      return this._processedLines[body]
    }

    const contents = body.replace(expressions.interpolate, (i, group, oCurly, matched, eCurly) => {
      /**
       * If expression starts with @ it should not
       * be touched.
       */
      if (group === '@') {
        return oCurly && eCurly ? `{{{${matched}}}}` : `{{${matched}}}`
      }

      try {
        const parsedStatement = lexer.parseRaw(matched).toStatement()
        return oCurly && eCurly ? `\${${parsedStatement}}` : `\${${lexer.escapeFn}(${parsedStatement})}`
      } catch (e) {
        throw CE.InvalidExpressionException.invalidLineExpression(matched, lineno, body.indexOf(matched))
      }
    })

    /**
     * Storing processed lines with their output. This will not reparse
     * the expression when it is used twice in a single template.
     */
    this._processedLines[body] = contents
    if (writeToBuffer) {
      this.buffer.writeToOutput(`${contents}`)
    }
    return contents
  }

  /**
   * Converts the template to abstract syntax tree.
   * Which can later be compiled via compileAst.
   *
   * @method toAst
   *
   * @param {String} template
   *
   * @return {Array}
   *
   * @private
   */
  _toAst (template) {
    return new Ast(this._tags, template).parse()
  }

  /**
   * Compiles the generated ast to an array
   * of pre-compiled lines
   *
   * @param {Array} ast
   *
   * @method _compileAst
   *
   * @return {Array}
   *
   * @private
   */
  _compileAst (ast) {
    ast.forEach((leaf) => this.parseLine(leaf))
    return this.buffer.getLines()
  }

  /**
   * Parses each line on the ast. If line is a tag,
   * it will call the tag fn, otherwise parses
   * the expressions `{{}}` within the line.
   *
   * @method parseLine
   *
   * @param  {String}  line
   * @param  {Boolean} writeToBuffer
   *
   * @return {void}
   */
  parseLine (line, writeToBuffer = true) {
    if (line.tag) {
      return this._parseTagLine(line, writeToBuffer)
    }
    return this._parseRawLine(line, writeToBuffer)
  }

  /**
   * Compile the template by converting it to
   * ast and then process each line/tag
   * within the ast.
   *
   * @method compile
   *
   * @param {String} view
   *
   * @return {Array}
   */
  compile (view) {
    const template = this._loader.load(view)
    const output = this._compileAst(this._toAst(template))
    debug('compiled template to %s', output)
    return output
  }

  /**
   * Compile a raw string
   *
   * @method compileString
   *
   * @param  {String}      statement
   *
   * @return {String}
   */
  compileString (statement) {
    const output = this._compileAst(this._toAst(statement))
    debug('compiled template to %s', output)
    return output
  }

  /**
   * Get a unique runtime variable for a given template
   *
   * @method runtimeVariable
   *
   * @param  {String}        [prefix = 'var']
   *
   * @return {String}
   */
  runtimeVariable (prefix = 'var') {
    this._runtimeVarIndex++
    return `${prefix}_${this._runtimeVarIndex}`
  }
}

module.exports = TemplateCompiler
