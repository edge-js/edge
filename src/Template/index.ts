/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Context } from '../Context'
import { IPresenter } from '../Contracts'
import { Compiler } from '../Compiler'

export class Template {
  constructor (private compiler: Compiler, private sharedState: any) {
  }

  public renderInline (template: string): Function {
    return new Function('template', 'ctx', this.compiler.compile(template, 'default', true))
  }

  public render (template: string, presenter: IPresenter, diskName?: string): string {
    const compiledTemplate = this.compiler.compile(template, diskName)
    const ctx = new Context(presenter, this.sharedState)
    return new Function('template', 'ctx', `return ${compiledTemplate}`)(this, ctx)
  }
}
