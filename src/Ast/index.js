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
const EOL = require('../../lib/EOL')
const CE = require('../Exceptions')

/**
 * The opening tag to detect the start of
 * block html comment.
 *
 * @type {RegExp}
 */
const openingHtmlComment = /^(\s*{{--\s*$)/

/**
 * The closing tag to detect end of block
 * html comment.
 *
 * @type {RegExp}
 */
const closingHtmlComment = /(--}}$)/

/**
 * Detect inline HTML comments
 *
 * @type {RegExp}
 */
const singleLineComment = /({{--.*?--}})/g

/**
 * Ast parser generates a syntax tree for the template files.
 * This is 1st step in the process of compiling a template.
 * Since this class understands the concepts of edge tags,
 * it will create a tree with nested tags and their
 * childs.
 *
 * @class Ast
 * @constructor
 * @module Compiler
 */
class Ast {
  constructor (tags, blockExpression) {
    this._tags = tags
    this._blockExpression = blockExpression
    this._ast = []
    this._insideBlockComment = false
    this._openedTags = []
  }

  /**
   * Returns the token for a tag.
   *
   * @method _tokenForTag
   *
   * @param  {String}     line
   * @param  {String}     tag
   * @param  {String}     args
   * @param  {Number}     index
   * @param  {Boolean}    selfClosing
   *
   * @return {Object}
   *
   * @private
   */
  _tokenForTag (line, tag, args, index, selfClosing) {
    return {
      tag,
      args,
      selfClosing,
      childs: [],
      body: line,
      lineno: index + 1,
      end: {
        body: null,
        lineno: 0
      }
    }
  }

  /**
   * Returns the token for a line. Also it will
   * reomve the inline comments on a given line
   *
   * @method _tokenForLine
   *
   * @param  {String}      line
   * @param  {Number}      index
   *
   * @return {Object}
   *
   * @private
   */
  _tokenForLine (line, index) {
    line = line.replace(singleLineComment, '')

    return {
      tag: null,
      args: null,
      childs: [],
      body: line,
      lineno: index + 1
    }
  }

  /**
   * Returns the appropriate token object for a
   * given line. It uses the regex to find the
   * meaning of a line.
   *
   * @method _getTokenFor
   *
   * @param  {String}     line
   * @param  {Number}     index
   *
   * @return {Object}
   *
   * @private
   */
  _getTokenFor (line, index) {
    /**
     * Look for opening of a custom tag.
     */
    const [, selfClosing, tag, args] = this._blockExpression ? (this._blockExpression.exec(line) || []) : []
    if (tag) {
      return this._tokenForTag(line, tag, args, index, !!selfClosing)
    }

    /**
     * Finally fallback to a plain line token.
     */
    return this._tokenForLine(line, index)
  }

  /**
   * Returns whether a line is a closing tag.
   *
   * @method _isClosingTag
   *
   * @param  {Object}      lastTag
   * @param  {String}      line
   *
   * @return {Boolean}
   *
   * @private
   */
  _isClosingTag (lastTag, line) {
    return lastTag && `@end${lastTag.tag}` === line.trim()
  }

  /**
   * Detects the start of a block level
   * comment.
   *
   * @method _detectedBlockCommentStart
   *
   * @param  {String}                   line
   *
   * @return {Boolean}
   */
  _detectedBlockCommentStart (line) {
    const [, start] = openingHtmlComment.exec(line) || []
    if (start) {
      this._insideBlockComment = true
    }
    return !!start
  }

  /**
   * Look for the end of a block level comment
   *
   * @method _lookForBlockCommentEnd
   *
   * @param  {String}                line
   *
   * @return {void}
   */
  _lookForBlockCommentEnd (line) {
    const [, end] = closingHtmlComment.exec(line) || []
    if (end) {
      this._insideBlockComment = false
    }
  }

  /**
   * Parses the template string by tokenizing it
   * into multiple lines and then converting
   * each line into a tree branch or leaf.
   *
   * @param {String} template
   *
   * @method parse
   *
   * @return {Array}
   *
   * @throws {InvalidTemplateException} If there are unclosed tags found
   */
  parse (template) {
    template
      .trim()
      .split(EOL)
      .forEach((line, index) => {
        /**
         * Do not process anything when inside the block
         * comment
         */
        if (this._insideBlockComment) {
          this._lookForBlockCommentEnd(line)
          return
        }

        /**
         * Do not process line when line is a block comment
         * start.
         */
        if (this._detectedBlockCommentStart(line)) {
          return
        }

        const lastTag = _.last(this._openedTags)

        /**
         * If line is a closing of a custom tag or an html block
         * we need to mark the recently opened tag as closed.
         */
        if (this._isClosingTag(lastTag, line)) {
          this._openedTags.pop()
          lastTag.end.body = line.trim()
          lastTag.end.lineno = index + 1
          return
        }

        /**
         * Otherwise grab the token for the line
         */
        const token = this._getTokenFor(line, index)

        /**
         * Do not process line when original line has
         * content but the processed one is empty.
         * It happens when line only has a single
         * inline comment.
         */
        if (line.length && !token.body.length) {
          return
        }

        /**
         * If token is a tag and (is a block level tag OR comment tag)
         * then we need to push it to list of opened tags and wait
         * for it to close.
         */
        if (token.tag && this._tags[token.tag].isBlock === true && !token.selfClosing) {
          this._openedTags.push(token)
        }

        /**
         * Push to lastTag childs or the actual ast.
         */
        lastTag ? lastTag.childs.push(token) : this._ast.push(token)
      })

    /**
     * Bad template with opened tags found
     */
    const openedTag = _.last(this._openedTags)

    /**
     * Make sure there are no opened tags found
     */
    if (openedTag) {
      throw CE.InvalidTemplateException.unClosedTag(openedTag.tag, openedTag.lineno, openedTag.body)
    }

    return this._ast
  }
}

module.exports = Ast
