/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { merge } from 'lodash'
import { Template } from '../Template'
import { EdgeRendererContract, CompilerContract } from '../Contracts'

/**
 * Renders a given template with it's shared state
 */
export class EdgeRenderer implements EdgeRendererContract {
  private _locals: any = {}

  constructor (private _compiler: CompilerContract, private _globals: any) {}

  /**
   * Share local variables with the template. They will overwrite the
   * globals
   */
  public share (data: any): this {
    merge(this._locals, data)
    return this
  }

  /**
   * Render the template
   */
  public render (templatePath: string, state: any = {}): string {
    const template = new Template(this._compiler, this._globals, this._locals)
    return template.render(templatePath, state)
  }
}
