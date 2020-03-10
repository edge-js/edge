/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { TagContract } from '../Contracts'

export const elseTag: TagContract = {
  block: false,
  seekable: false,
  tagName: 'else',

  /**
   * Compiles else block node to Javascript else statement
   */
  compile (_, buffer, token) {
    buffer.writeStatement('} else {', token.filename, -1)
  },
}
