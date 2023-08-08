/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import lodash from '@poppinss/utils/lodash'

import { Template } from '../template.js'
import { Processor } from '../processor.js'
import type { Compiler } from '../compiler.js'

/**
 * Renders a given template with it's shared state
 */
export class EdgeRenderer {
  #compiler: Compiler
  #processor: Processor
  #asyncCompiler: Compiler

  /**
   * Global state
   */
  #locals: Record<string, any> = {}
  #globals: Record<string, any>

  constructor(compiler: Compiler, asyncCompiler: Compiler, globals: any, processor: Processor) {
    this.#compiler = compiler
    this.#asyncCompiler = asyncCompiler
    this.#processor = processor

    this.#globals = globals
  }

  /**
   * Share local variables with the template. They will overwrite the
   * globals
   */
  share(data: Record<string, any>): this {
    lodash.merge(this.#locals, data)
    return this
  }

  /**
   * Render the template
   */
  async render(templatePath: string, state: Record<string, any> = {}): Promise<string> {
    return new Template(this.#asyncCompiler, this.#globals, this.#locals, this.#processor).render(
      templatePath,
      state
    )
  }

  /**
   * Render the template
   */
  renderSync(templatePath: string, state: Record<string, any> = {}): string {
    return new Template(
      this.#compiler,
      this.#globals,
      this.#locals,
      this.#processor
    ).render<string>(templatePath, state)
  }

  /**
   * Render the template from a raw string
   */
  async renderRaw(
    contents: string,
    state: Record<string, any> = {},
    templatePath?: string
  ): Promise<string> {
    return new Template(
      this.#asyncCompiler,
      this.#globals,
      this.#locals,
      this.#processor
    ).renderRaw(contents, state, templatePath)
  }

  /**
   * Render the template from a raw string
   */
  renderRawSync(contents: string, state: Record<string, any> = {}, templatePath?: string): string {
    return new Template(this.#compiler, this.#globals, this.#locals, this.#processor).renderRaw(
      contents,
      state,
      templatePath
    )
  }
}
