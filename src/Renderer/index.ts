/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { lodash } from '@poppinss/utils'

import { Template } from '../Template'
import { Processor } from '../Processor'
import { EdgeRendererContract, CompilerContract } from '../Contracts'

/**
 * Renders a given template with it's shared state
 */
export class EdgeRenderer implements EdgeRendererContract {
  private locals: any = {}

  constructor(
    private compiler: CompilerContract,
    private asyncCompiler: CompilerContract,
    private globals: any,
    private processor: Processor
  ) {}

  /**
   * Share local variables with the template. They will overwrite the
   * globals
   */
  public share(data: any): this {
    lodash.merge(this.locals, data)
    return this
  }

  /**
   * Render the template
   */
  public render(templatePath: string, state: any = {}): string {
    return new Template(this.compiler, this.globals, this.locals, this.processor).render<string>(
      templatePath,
      state
    )
  }

  /**
   * Render the template
   */
  public async renderAsync(templatePath: string, state: any = {}): Promise<string> {
    return new Template(this.asyncCompiler, this.globals, this.locals, this.processor).render(
      templatePath,
      state
    )
  }
}
