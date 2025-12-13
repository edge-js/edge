/*
 * edge.js
 *
 * (c) Harminder Virk
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EdgeError } from 'edge-error'
import { expressions } from 'edge-parser'
import { type TagContract } from '../types.js'
import { nanoid } from '../utils.js'

/**
 * Stack tag to define stack placeholders
 */
export const pushToTag: TagContract & { generateId(): string } = {
  tagName: 'pushTo',
  block: true,
  seekable: true,
  noNewLine: true,
  generateId() {
    return `stack_${nanoid()}`
  },
  compile(parser, buffer, token) {
    const parsed = parser.utils.transformAst(
      parser.utils.generateAST(token.properties.jsArg, token.loc, token.filename),
      token.filename,
      parser
    )

    /**
     * Disallow sequence expressions
     */
    if (expressions.SequenceExpression.includes(parsed.type)) {
      throw new EdgeError(
        `"${token.properties.jsArg}" is not a valid argument type for the "@pushTo" tag`,
        'E_UNALLOWED_EXPRESSION',
        {
          ...parser.utils.getExpressionLoc(parsed),
          filename: token.filename,
        }
      )
    }

    /**
     * Each stack must be unique
     */
    const stackId = this.generateId()

    /**
     * Create a custom buffer for the stack. Since we do not want to the write
     * to the main buffer
     */
    const stackBuffer = buffer.create(token.filename, { outputVar: stackId })

    /**
     * Process children
     */
    for (let child of token.children) {
      parser.processToken(child, stackBuffer)
    }

    /**
     * Flush the stack buffer content to the main buffer
     */
    buffer.writeStatement(
      stackBuffer
        .disableFileAndLineVariables()
        .disableReturnStatement()
        .disableTryCatchBlock()
        .flush(),
      token.filename,
      token.loc.start.line
    )

    buffer.writeExpression(
      `template.stacks.pushTo(${parser.utils.stringify(parsed)}, ${stackId})`,
      token.filename,
      token.loc.start.line
    )
  },
}
