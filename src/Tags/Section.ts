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
 * Section tag is used to define the sections on a given template. Sections cannot be
 * nested and must appear as top level children inside a component.
 */
export const sectionTag: TagContract = {
  block: true,
  seekable: true,
  tagName: 'section',

  compile (parser, buffer, token) {
    token.children.forEach((token) => parser.processToken(token, buffer))
  },
}
