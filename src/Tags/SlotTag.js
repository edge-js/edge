'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/**
 * The official slot tag. It is used
 * as `@slot` inside templates. Make
 * sure to use slot inside the
 * component only.
 *
 * @class SlotTag
 * @extends {BaseTag}
 * @static
 */
class SlotTag {
  /**
   * The tagname to be used for registering
   * the tag
   *
   * @attribute tagName
   *
   * @return {String}
   */
  get tagName () {
    return 'slot'
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
   * Nothing needs to be done here, since component
   * tag will take care of slots.
   *
   * @method compile
   */
  compile () {}

  /**
   * Nothing needs to be in done in runtime for
   * a slot tag.
   *
   * @method run
   */
  run () {}
}

module.exports = SlotTag
