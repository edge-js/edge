'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')
const debug = require('debug')('edge:compiler')
const LayoutTag = require('../Tags/LayoutTag')
const lexer = new (require('../Lexer'))(true)
const InternalBuffer = require('../Buffer')
const CE = require('../Exceptions')
const Ast = require('../Ast')

/**
 * Static expression. They never change
 */
const expressions = {
  interpolate: /(@)?({{2,3})(.+?)}{2,3}/g
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
    this._blockRegExp = new RegExp(`^\\s*\\@(!?)(${_.keys(tags).join('|')})(?:\\((.*)\\)?)?`)
    this._loader = loader
    this.buffer = new InternalBuffer(asFunction)
    this._runtimeVarIndex = 0
  }

  /**
   * Interpolates a line with mustace like syntax into
   * a javascript output.
   *
   * @method _interpolateMustache
   *
   * @param  {String}             options.body
   * @param  {Number}             options.lineno
   *
   * @return {String}
   */
  _interpolateMustache (body, lineno) {
    return body.replace(expressions.interpolate, (i, group, oCurly, matched) => {
      /**
       * If expression starts with @ it should not
       * be touched.
       */
      if (group === '@') {
        return oCurly === '{{{' ? `{{{${matched}}}}` : `{{${matched}}}`
      }

      try {
        const parsedStatement = lexer.parseRaw(matched).toStatement()
        return oCurly === '{{{' ? `\${${parsedStatement}}` : `\${${lexer.escapeFn}(${parsedStatement})}`
      } catch (e) {
        throw CE.InvalidExpressionException.invalidLineExpression(matched, lineno, body.indexOf(matched))
      }
    })
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
    return new Ast(this._tags, this._blockRegExp).parse(template)
  }

  /**
   * Returns a boolean indicating if the template
   * has a layout defined
   *
   * @method _hasLayout
   *
   * @param  {Array}  ast
   *
   * @return {Boolean}
   */
  _hasLayout (ast) {
    return ast[0].body.startsWith('@layout')
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
   * Compiles the ast as a layout
   *
   * @method _compileAstAsLayout
   *
   * @param  {Array}         ast
   *
   * @return {String}
   *
   * @private
   *
   */
  _compileAstAsLayout (ast) {
    const layoutLine = ast.shift()
    new LayoutTag().compile(this, lexer, this.buffer, layoutLine, ast)
    return this.buffer.getLines()
  }

  /**
   * Compile a line with a tag. Output will be
   * written to buffer by the implemented tag.
   *
   * @method parseTag
   *
   * @param  {String}      options.tag
   * @param  {String}      options.args
   * @param  {Array}       options.childs
   * @param  {Number}      options.lineno
   *
   * @return {void}
   */
  parseTag ({ tag, args, childs, lineno }) {
    this._tags[tag].compile(this, lexer, this.buffer, {
      body: args,
      childs: childs,
      lineno: lineno
    })
  }

  /**
   * Parse raw line by doing a regex replace. Here we
   * write to the buffer output.
   *
   * @method parsePlainLine
   *
   * @param  {Object}      line
   *
   * @return {void}
   */
  parsePlainLine ({ body, lineno }) {
    this.buffer.writeToOutput(this._interpolateMustache(body, lineno))
  }

  /**
   * Parses each line on the ast. If line is a tag,
   * it will call the tag fn, otherwise parses
   * the expressions `{{}}` within the line.
   *
   * @method parseLine
   *
   * @param  {String}  line
   *
   * @return {void}
   */
  parseLine (line) {
    if (line.tag) {
      this.parseTag(line)
      return
    }
    this.parsePlainLine(line)
  }

  /**
   * Parses a line and returns the output
   * instead of writing it to the buffer.
   *
   * @method parseAndReturnLine
   *
   * @param  {Object}           line
   *
   * @return {String}
   */
  parseAndReturnLine (line) {
    if (line.tag) {
      const templateInstance = new TemplateCompiler(this._tags, this._loader, true)
      const output = templateInstance._compileAst([line])
      return `\${${output.replace(/^return/, '')}}`
    }
    return this._interpolateMustache(line.body, line.lineno)
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
    const ast = this._toAst(template)
    const output = this._hasLayout(ast) ? this._compileAstAsLayout(ast) : this._compileAst(ast)

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
    const ast = this._toAst(statement)
    const output = this._hasLayout(ast) ? this._compileAstAsLayout(ast) : this._compileAst(ast)

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
