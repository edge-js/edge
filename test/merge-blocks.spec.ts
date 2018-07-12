/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import { parseSequenceExpression } from '../src/utils'
import { Parser } from 'edge-parser'
import { EdgeBuffer } from 'edge-parser/build/src/EdgeBuffer'
import { IBlockNode } from 'edge-lexer/build/src/Contracts'

const tags = {
  if: class If {
    public static block = true
    public static seekable = true
    public static selfclosed = false
    public static tagName = 'if'
    public static compile (parser: Parser, buffer: EdgeBuffer, token: IBlockNode): void {
    }
  },
}

test.group('mergeBlocks', () => {
})
