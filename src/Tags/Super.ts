/**
 * @module edge
 */

/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { TagContract } from '../Contracts'

/**
 * Super tag is used inside sections to inherit the parent section
 * content.
 *
 * The implementation of super tag is handled by the compiler itself, but we need
 * the tag to exists, so that the lexer can parse it as a tag.
 */
export const superTag: TagContract = {
  block: false,
  seekable: false,
  tagName: 'super',

  compile () {
    // The super tag is handled by the compiler itself. I am just a way to
    // tell lexer to parse me as an inline node
  },
}
