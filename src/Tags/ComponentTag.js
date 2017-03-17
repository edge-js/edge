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
const CE = require('../Exceptions')

/**
 * The official component tag. It is used
 * as `@component` inside templates.
 *
 * @class ComponentTag
 * @extends {BaseTag}
 * @static
 */
class ComponentTag extends BaseTag {
  /**
   * The tag name to used for registering the tag
   *
   * @attribute tagName
   *
   * @return {String}
   */
  get tagName () {
    return 'component'
  }

  /**
   * Whether tag is a block level tag or
   * not.
   *
   * @attribute isBlock
   *
   * @return {Boolean}
   */
  get isBlock () {
    return true
  }

  /**
   * The expressions allowed to be passed to the
   * tag. Any other expressions will cause an
   * error.
   *
   * @attribute allowedExpressions
   *
   * @return {Array}
   */
  get allowedExpressions () {
    return ['SequenceExpression', 'Literal', 'Identifier']
  }

  /**
   * Returns the parsed slot name or throws
   * and exception if slot name is not a
   * literal
   *
   * @method _parseSlotName
   *
   * @param  {Object}       parser
   * @param  {String}       name
   *
   * @return {String}
   *
   * @private
   */
  _parseSlotName (lexer, name, lineno) {
    try {
      return lexer.parseRaw(name, ['Literal']).value
    } catch (e) {
      const message = `Invalid name <${name}> passed to slot. Only strings are allowed`
      throw CE.InvalidExpressionException.generic(message, lineno, 0)
    }
  }

  /**
   * Returns an object of slots and their
   * parsed contents. Anything outside
   * of slots will be pushed to the
   * main slot.
   *
   * @method _getSlots
   *
   * @param  {Object}  parser
   * @param  {Object}  lexer
   * @param  {Array}   childs
   * @param  {Number}  lineno
   *
   * @return {Object}
   *
   * @private
   */
  _getSlots (parser, lexer, childs, lineno) {
    let slotLineNo = lineno
    return _.transform(childs, (result, child) => {
      if (child.tag === 'slot') {
        /**
         * ++ for the opening tag
         */
        slotLineNo++
        const name = this._parseSlotName(lexer, child.args, slotLineNo)
        result[name] = _.map(child.childs, (child) => parser.parseLine(child, false))

        /**
         * add the childs length
         * +1 for the closing tag
         */
        slotLineNo = slotLineNo + child.childs.length + 1
      } else {
        slotLineNo++
        result.slot.push(parser.parseLine(child, false))
      }
      return result
    }, {slot: []})
  }

  /**
   * Returns the component name and the props to be passed
   * along as the data attribute to the component.
   *
   * @method _getComponentNameAndProps
   *
   * @param  {Object}                  lexer
   * @param  {String}                  statement
   *
   * @return {Object}
   *
   * @private
   */
  _getComponentNameAndProps (lexer, statement) {
    if (statement.type !== 'sequence') {
      return { name: statement.toStatement(), props: [] }
    }

    const [firstChild, ...props] = statement.toObject()
    const name = lexer.parseRaw(firstChild).toStatement()
    return { name, props }
  }

  /**
   * Compiles the component tag and its childs
   *
   * @method compile
   *
   * @param  {Object} parser
   * @param  {Object} lexer
   * @param  {Object} buffer
   * @param  {String} options.body
   * @param  {Array} options.childs
   * @param  {Number} options.lineno
   *
   * @return {void}
   */
  compile (parser, lexer, buffer, { body, childs, lineno }) {
    const compiledStatement = this._compileStatement(lexer, body, lineno)
    const { name, props } = this._getComponentNameAndProps(lexer, compiledStatement)
    const slots = this._getSlots(parser, lexer, childs, lineno)

    /**
     * Isolated the component instance.
     */
    buffer.startIsolation()

    /**
     * Start a new frame to write component slots
     * values.
     */
    buffer.writeLine(`${lexer.newFrameFn}()`)

    /**
     * Write all slots to the newly created frame.
     */
    _.each(slots, (value, key) => {
      buffer.writeLine(`${lexer.setOnFrameFn}('$${key}', \`${value.join('\n')}\`)`)
    })

    /**
     * Render the component in runtime, since component name can
     * be dynamic aswell.
     */
    buffer.writeToOutput(`$\{${lexer.runTimeRenderFn}(${name})}`)

    /**
     * Clear the frame
     */
    buffer.writeLine(`${lexer.clearFrameFn}()`)

    /**
     * End the isolation
     */
    buffer.endIsolation(props)
  }

  /**
   * Nothing needs to be done in runtime for
   * a component tag
   *
   * @method run
   */
  run () {
  }
}

module.exports = ComponentTag
