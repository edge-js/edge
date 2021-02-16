/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EdgeError } from 'edge-error'
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

  compile(_, __, token) {
    throw new EdgeError(
      '@super tag must appear as top level tag inside the @section tag',
      'E_ORPHAN_SUPER_TAG',
      {
        line: token.loc.start.line,
        col: token.loc.start.col,
        filename: token.filename,
      }
    )
  },
}
