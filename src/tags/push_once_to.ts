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

import { nanoid } from '../utils.js'
import { TagContract } from '../types.js'
import type { Template } from '../template.js'

declare module '../template.js' {
  export interface Template {
    stackSources: Record<string, boolean>
    trackStackSource(stack: string, filename: string, line: string, col: string): boolean
  }
}

/**
 * Stack tag to define stack placeholders
 */
export const pushOnceToTag: TagContract & { generateId(): string } = {
  tagName: 'pushOnceTo',
  block: true,
  seekable: true,
  noNewLine: true,
  generateId() {
    return `stack_${nanoid()}`
  },
  boot(template) {
    /**
     * Tracking stack sources to avoid duplicate calls
     * from the same file:line:col
     */
    template.getter(
      'stackSources',
      () => {
        return {}
      },
      true
    )

    template.macro('trackStackSource', function (this: Template, stack, filename, line, col) {
      const key = `${stack}_${filename}_${line}_${col}`
      if (this.stackSources[key]) {
        return false
      }

      this.stackSources[key] = true
      return true
    })
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
        `"${token.properties.jsArg}" is not a valid argument type for the "@pushOnceTo" tag`,
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
    const stackName = parser.utils.stringify(parsed)

    /**
     * Create a custom buffer for the stack. Since we do not want to the write
     * to the main buffer
     */
    const stackBuffer = buffer.create(token.filename, { outputVar: stackId })

    const { line, col } = token.loc.start
    const normalizedFileName = token.filename.replace(/\\|\//g, '_')
    const conditional = `template.trackStackSource(${stackName}, '${normalizedFileName}', ${line}, ${col})`

    /**
     * Start if block
     */
    buffer.writeStatement(`if (${conditional}) {`, token.filename, line)

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
      line
    )

    buffer.writeExpression(
      `template.stacks.pushTo(${parser.utils.stringify(parsed)}, ${stackId})`,
      token.filename,
      line
    )

    /**
     * End if block
     */
    buffer.writeStatement('}', token.filename, line)
  },
}
