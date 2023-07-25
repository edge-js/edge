/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import lodash from '@poppinss/utils/lodash'

import { Template } from '../template/index.js'
import { Processor } from '../processor/index.js'
import { EdgeRendererContract, CompilerContract } from '../types.js'

/**
 * Renders a given template with it's shared state
 */
export class EdgeRenderer implements EdgeRendererContract {
  #locals: any = {}
  #compiler: CompilerContract
  #asyncCompiler: CompilerContract
  #globals: any
  #processor: Processor

  constructor(
    compiler: CompilerContract,
    asyncCompiler: CompilerContract,
    globals: any,
    processor: Processor
  ) {
    this.#compiler = compiler
    this.#asyncCompiler = asyncCompiler
    this.#globals = globals
    this.#processor = processor
  }

  /**
   * Share local variables with the template. They will overwrite the
   * globals
   */
  share(data: any): this {
    lodash.merge(this.#locals, data)
    return this
  }

  /**
   * Render the template
   */
  async render(templatePath: string, state: any = {}): Promise<string> {
    return new Template(this.#asyncCompiler, this.#globals, this.#locals, this.#processor).render(
      templatePath,
      state
    )
  }

  /**
   * Render the template
   */
  renderSync(templatePath: string, state: any = {}): string {
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
  async renderRaw(contents: string, state: any = {}, templatePath?: string): Promise<string> {
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
  renderRawSync(contents: string, state: any = {}, templatePath?: string): string {
    return new Template(this.#compiler, this.#globals, this.#locals, this.#processor).renderRaw(
      contents,
      state,
      templatePath
    )
  }
}
