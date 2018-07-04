/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Parser } from 'edge-parser'
import { EdgeBuffer } from 'edge-parser/build/src/EdgeBuffer'
import { IBlockNode, INode } from 'edge-lexer/build/src/Contracts'
import { disAllowExpressions } from '../utils'

export class IfTag {
  public static block = true
  public static seekable = true
  public static selfclosed = false

  /**
   * Expressions which are not allowed by the sequence
   * expression
   *
   * @type {Array}
   */
  protected bannedExpressions = ['SequenceExpression']

  /**
   * Returns a boolean telling whether the node with newline has a parent
   * of else or elseif.
   */
  private _childOfElse (children: (IBlockNode | INode)[], index: number): boolean {
    const node = children[index - 1]
    if (!node || node.type !== 'block') {
      return false
    }

    return ['else', 'elseif'].indexOf((node as IBlockNode).properties.name) > -1
  }

  /**
   * Compiles the if block node to a Javascript if statement
   */
  public compile (parser: Parser, buffer: EdgeBuffer, token: IBlockNode) {
    const parsed = parser.parseJsArg(token.properties.jsArg, token.lineno)
    disAllowExpressions('if', parsed, this.bannedExpressions)

    /**
     * Start if block
     */
    buffer.writeStatement(`if(${parser.statementToString(parsed)}) {`)

    /**
     * Indent upcoming code
     */
    buffer.indent()

    /**
     * Removing first and last newlines, they are redudant and will hurt
     * when not using HTML as the markup language
     */
    token.children.shift()
    token.children.pop()

    /**
     * Process of all kids recursively
     */
    token.children.forEach((child, index) => {
      /**
       * Ignoring newlines right after the else tag, since else itself
       * doesn't have children and if has to handle it
       */
      if (child.type === 'newline' && this._childOfElse(token.children, index)) {
        return
      }

      parser.processToken(child, buffer)
    })

    /**
     * Remove identation
     */
    buffer.dedent()

    /**
     * Close if block
     */
    buffer.writeStatement('}')
  }
}
