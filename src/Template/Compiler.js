'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const os = require('os')
const _ = require('lodash')
const debug = require('debug')('edge:compiler')
const lexer = new (require('../Lexer'))(true)
const InternalBuffer = require('../Buffer')
const CE = require('../Exceptions')

/**
 * Static expression. They never change
 */
const expressions = {
  interpolate: /(@)?{{({)?\s+(.+?)\s+(})?}}/g
}

class TemplateCompiler {
  constructor (tags, template) {
    this.tags = tags
    /**
     * Creating a regex for only available tags. Which means
     * any expression starting with `@` will not be treated
     * as a tag unless it has been defined as a tag.
     */
    this.blockExpression = this._makeBlockRegex()
    this.template = template
    this.ast = []
    this.openedTags = []
    this.buffer = new InternalBuffer()
    this._processedLines = {}
  }

  /**
   * Makes a dynamic regex for all tags
   *
   * @method _makeBlockRegex
   *
   * @return {Regex}
   */
  _makeBlockRegex () {
    return new RegExp(`^\\s*\\@(${_.keys(this.tags).join('|')})(?:\\((.*)\\))?`)
  }

  /**
   * Parse a line with a tag. Output should be
   * written to buffer by the implemented tag.
   *
   * @method _parseTagLine
   *
   * @param  {Object}      line
   *
   * @return {void}
   */
  _parseTagLine (line) {
    try {
      this.tags[line.tag].compile(this, lexer, this.buffer, {
        body: line.args,
        childs: line.childs,
        lineno: line.lineno
      })
    } catch (e) {
      if (e.name === 'InvalidExpressionException') {
        throw e
      }
      throw CE.InvalidExpressionException.invalidTagExpression(line.args, line.tag, line.lineno)
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
   */
  _parseRawLine ({ body, lineno }) {
    if (this._processedLines[body]) {
      this.buffer.writeToOutput(`${this._processedLines[body]}`)
      return
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
        return oCurly && eCurly ? `\${${parsedStatement}}` : `\${this.escape(${parsedStatement})}`
      } catch (e) {
        throw CE.InvalidExpressionException.invalidLineExpression(matched, lineno, body.indexOf(matched))
      }
    })

    /**
     * Storing processed lines with their output. This will not reparse
     * the expression when it is used twice in a single template.
     */
    this._processedLines[body] = contents
    this.buffer.writeToOutput(`${contents}`)
  }

  /**
   * Converts the template to abstract syntax tree.
   * Which can later be compiled via compileAst.
   *
   * @method toAst
   *
   * @return {Array}
   */
  toAst () {
    this
      .template
      .trim()
      .split(os.EOL)
      .forEach((line, number) => {
        const [match, tag, args] = this.blockExpression.exec(line) || []
        const token = {
          tag: null,
          args: null,
          childs: [],
          body: line,
          lineno: (number + 1)
        }

        /**
         * STEP: 1
         * Add tag and args property if there is
         * a regex match
         */
        if (tag) {
          token.tag = tag
          token.args = args
          // trim if line is a tag otherwise we need to preserve whitespace
          token.body = token.body.trim()
        }

        /**
         * STEP: 2
         * Look for the recently opened tags and
         * push new tags as childs until it is
         * closed.
         */
        const lastTag = _.last(this.openedTags)
        if (lastTag) {
          (`@end${lastTag.tag}` === `${token.body}`.trim()) ? this.openedTags.pop() : lastTag.childs.push(token)
          return
        }

        /**
         * STEP: 3 Push to opened tags when tag
         * has a tag property
         */
        if (token.tag && this.tags[token.tag].isBlock === true) {
          this.openedTags.push(token)
        }

        /**
         * STEP: 4 Push to ast array
         */
        this.ast.push(token)
      })

    /**
     * Bad template with opened tags found
     */
    const openedTag = this.openedTags[0]

    /**
     * Make sure there are no opened tags found
     */
    if (openedTag) {
      throw CE.InvalidTemplateException.unClosedTag(openedTag.tag, openedTag.lineno, openedTag.body)
    }

    return this.ast
  }

  /**
   * Compiles the generated ast to an array
   * of pre-compiled lines
   *
   * @param {Array} [ast]
   *
   * @method compileAst
   *
   * @return {Array}
   */
  compileAst () {
    this.ast.forEach(this.parseLine.bind(this))
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
   *
   * @return {void}
   */
  parseLine (line) {
    if (line.tag) {
      this._parseTagLine(line)
      return
    }

    this._parseRawLine(line)
  }

  /**
   * Compile the template by converting it to
   * ast and then process each line/tag
   * within the ast.
   *
   * @method compile
   *
   * @return {Array}
   */
  compile () {
    this.toAst()
    const output = this.compileAst()
    debug('compiled template to %s', output)
    return output
  }
}

module.exports = TemplateCompiler
