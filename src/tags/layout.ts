/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { TagContract } from '../types.js'

/**
 * Layout tag is used to define parent layout for a given template. The layout
 * must appear in the first line of the template itself.
 */
export const layoutTag: TagContract = {
  block: false,
  seekable: true,
  tagName: 'layout',
  noNewLine: true,

  compile() {
    // The layouts are handled by the template itself. I am just a way to
    // tell lexer to parse me as a block node
  },
}
