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
import { IPresenterConstructor } from '../Contracts'

export class Template {
  private sharedState: any

  constructor (private compiler: Compiler, globals: any, locals: any) {
    this.sharedState = merge({}, globals, locals)
  }

  public renderInline (templatePath: string): Function {
    return new Function('template', 'ctx', this.compiler.compile(templatePath, true))
  }

  public renderWithState (template: string, state: object, slots: object): string {
    const compiledTemplate = this.compiler.compile(template)
    const presenter = new BasePresenter(Object.assign(state, { $slots: slots }))
    const ctx = new Context(presenter, this.sharedState)

    return new Function('template', 'ctx', `return ${compiledTemplate}`)(this, ctx)
  }

  public render (template: string, state: object, Presenter: IPresenterConstructor = BasePresenter): string {
    const compiledTemplate = this.compiler.compile(template)
    const presenter = new Presenter(state)
    const ctx = new Context(presenter, this.sharedState)

    return new Function('template', 'ctx', `return ${compiledTemplate}`)(this, ctx)
  }
}
