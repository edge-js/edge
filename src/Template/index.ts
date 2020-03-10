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
import { CompilerContract } from '../Contracts'
import { Presenter as BasePresenter } from '../Presenter'

/**
 * The template is used to compile and run templates. Also the instance
 * of template is passed during runtime to render `dynamic partials`
 * and `dynamic components`.
 */
export class Template {
  /**
   * The shared state is used to hold the globals and locals,
   * since it is shared with components too.
   */
  private sharedState: any

  constructor (private compiler: CompilerContract, globals: any, locals: any) {
    this.sharedState = merge({}, globals, locals)
  }

  /**
   * Render the template inline by sharing the state of the current template.
   *
   * ```js
   * const partialFn = template.renderInline('includes.user')
   *
   * // render and use output
   * partialFn(template, ctx)
   * ```
   */
  public renderInline (templatePath: string): Function {
    return new Function('template', 'ctx', this.compiler.compile(templatePath, true).template)
  }

  /**
   * Renders the template with custom state. The `sharedState` of the template is still
   * passed to this template.
   *
   * Also a set of custom slots can be passed along. The slots uses the state of the parent
   * template.
   *
   * ```js
   * template.renderWithState('components.user', { username: 'virk' }, slotsIfAny)
   * ```
   */
  public renderWithState (template: string, state: any, slots: any): string {
    const { template: compiledTemplate, Presenter } = this.compiler.compile(template, false)
    const presenter = new (Presenter || BasePresenter)(merge(state, { $slots: slots }), this.sharedState)
    const ctx = new Context(presenter)

    return new Function('template', 'ctx', compiledTemplate)(this, ctx)
  }

  /**
   * Render a template with it's state.
   *
   * ```js
   * template.render('welcome', { key: 'value' })
   * ```
   */
  public render (template: string, state: any): string {
    const { template: compiledTemplate, Presenter } = this.compiler.compile(template, false)
    const presenter = new (Presenter || BasePresenter)(state, this.sharedState)
    const ctx = new Context(presenter)
    return new Function('template', 'ctx', compiledTemplate)(this, ctx)
  }
}
