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
const os = require('os')
const CE = require('../Exceptions')

/**
 * Ast also known as **Abstract Syntax Tree** parses the plain
 * edge template into an array of lines grouped with block
 * and inline tag.
 *
 * This is 1st step towards parsing any template as it gives
 * meaning to an edge template by abstracting all the tags
 * and converting them into a tree.
 *
 * @class Ast
 * @constructor
 *
 * @example
 *
 * ```
 * const tags = {
 *   if: {
 *     tagName: 'if',
 *     isBlock: true,
 *     compile: function () {},
 *     run: function () {}
 *   }
 * }
 *
 * const template = `
 *    @if(username === 'virk')
 *      <p> Hello virk </p>
 *    @endif
 * `
 *
 * const ast = new Ast(tags, template).parse()
 * ```
 */
class Ast {
  constructor (tags, template) {
    this.tags = tags
    this.blockExpression = this._makeBlockRegex()
    this.template = template
    this.ast = []
    this.openedTags = []
  }

  /**
   * Makes a dynamic regex for all the available tags. It makes
   * the search limited to only defined tags.
   *
   * @method _makeBlockRegex
   *
   * @return {Regex}
   *
   * @private
   */
  _makeBlockRegex () {
    return new RegExp(`^\\s*\\@(${_.keys(this.tags).join('|')})(?:\\((.*)\\))?`)
  }

  /**
   * Parses the raw string into an abstract syntax tree. It
   * will use `os.EOL` as the line seperator.
   *
   * ### Note
   * The template will remove top and bottom white space, since there
   * is no meaning to that.
   *
   * @method parse
   *
   * @return {Array}
   *
   * @throws {InvalidTemplateException} If unclosed blocked tags found
   */
  parse () {
    this
      .template
      .trim()
      .split(os.EOL)
      .forEach((line, number) => {
        const [, tag, args] = this.blockExpression.exec(line) || []

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
         * Look for the recently opened tags and see if
         * this line is the ending block of the last
         * opened tag.
         */
        const lastTag = _.last(this.openedTags)
        if (lastTag && `@end${lastTag.tag}` === `${token.body}`.trim()) {
          this.openedTags.pop()
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
         * STEP: 4 Push to ast array or the recently opened tag
         */
        lastTag ? lastTag.childs.push(token) : this.ast.push(token)
      })

    /**
     * Bad template with opened tags found
     */
    const openedTag = _.last(this.openedTags)

    /**
     * Make sure there are no opened tags found
     */
    if (openedTag) {
      throw CE.InvalidTemplateException.unClosedTag(openedTag.tag, openedTag.lineno, openedTag.body)
    }

    return this.ast
  }
}

module.exports = Ast
