/*
 * edge-js
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { TagToken } from 'edge-lexer'
import { ProcessorContract, TemplateContract } from '../types.js'

/**
 * Exposes the API to register a set of handlers to process the
 * templates output at different stages
 */
export class Processor implements ProcessorContract {
  #handlers: Map<string, Set<(...args: any[]) => any>> = new Map()

  /**
   * Execute tag handler
   */
  executeTag(data: { tag: TagToken; path: string }): void {
    const handlers = this.#handlers.get('tag')
    if (!handlers) {
      return
    }

    handlers.forEach((handler) => {
      handler(data)
    })
  }

  /**
   * Execute raw handlers
   */
  executeRaw(data: { raw: string; path: string }): string {
    const handlers = this.#handlers.get('raw')
    if (!handlers) {
      return data.raw
    }

    handlers.forEach((handler) => {
      const output = handler(data)
      if (output !== undefined) {
        data.raw = output
      }
    })

    return data.raw
  }

  /**
   * Execute compiled handlers
   */
  executeCompiled(data: { compiled: string; path: string }): string {
    const handlers = this.#handlers.get('compiled')
    if (!handlers) {
      return data.compiled
    }

    handlers.forEach((handler) => {
      const output = handler(data)
      if (output !== undefined) {
        data.compiled = output
      }
    })

    return data.compiled
  }

  /**
   * Execute output handlers
   */
  executeOutput(data: {
    output: string
    template: TemplateContract
    state: Record<string, any>
  }): string {
    const handlers = this.#handlers.get('output')
    if (!handlers) {
      return data.output
    }

    handlers.forEach((handler) => {
      const output = handler(data)
      if (output !== undefined) {
        data.output = output
      }
    })

    return data.output
  }

  /**
   * Define a processor function
   */
  process(event: 'raw', handler: (data: { raw: string; path: string }) => string | void): this
  process(event: 'tag', handler: (data: { tag: TagToken; path: string }) => void): this
  process(
    event: 'compiled',
    handler: (data: { compiled: string; path: string }) => string | void
  ): this
  process(
    event: 'output',
    handler: (data: {
      output: string
      template: TemplateContract
      state: Record<string, any>
    }) => string | void
  ): this
  process(event: string, handler: (...args: any[]) => any): this {
    if (!this.#handlers.has(event)) {
      this.#handlers.set(event, new Set())
    }

    this.#handlers.get(event)!.add(handler)
    return this
  }
}
