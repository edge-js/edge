/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { merge } from 'lodash'
import { Context } from '../Context'
import { Compiler } from '../Compiler'
import { Presenter as BasePresenter } from '../Presenter'

export class Template {
  private sharedState: any

  constructor (private compiler: Compiler, globals: any, locals: any) {
    this.sharedState = merge({}, globals, locals)
  }

  /**
   * Render the inline template (aka partials)
   */
  public renderInline (templatePath: string): Function {
    return new Function('template', 'ctx', this.compiler.compile(templatePath, true).template)
  }

  /**
   * Renders an inline template, but with isolated state. This is
   * mainly used by the components
   */
  public renderWithState (template: string, state: object, slots: object): string {
    const { template: compiledTemplate, Presenter } = this.compiler.compile(template, false)
    const presenter = new (Presenter || BasePresenter)(Object.assign(state, { $slots: slots }))
    const ctx = new Context(presenter, this.sharedState)

    return new Function('template', 'ctx', `return ${compiledTemplate}`)(this, ctx)
  }

  /**
   * Renders the template by using the template path and the state. The presenter
   * is resolved by the loader itself
   */
  public render (template: string, state: object): string {
    const { template: compiledTemplate, Presenter } = this.compiler.compile(template, false)
    const presenter = new (Presenter || BasePresenter)(state)
    const ctx = new Context(presenter, this.sharedState)

    return new Function('template', 'ctx', `return ${compiledTemplate}`)(this, ctx)
  }
}
