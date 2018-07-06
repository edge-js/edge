/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as Tags from '../Tags'
import { Compiler } from '../Compiler'
import { Loader } from '../Loader'
import { Template } from '../Template'
import { Presenter } from '../Presenter'

export class Edge {
  private loader: Loader
  private compiler: Compiler

  constructor () {
    this.loader = new Loader()
    this.compiler = new Compiler(this.loader, Tags)
  }

  public mount (diskName: string, dirPath: string) {
    this.loader.mount(diskName, dirPath)
  }

  public unmount (diskName: string) {
    this.loader.unmount(diskName)
  }

  public render (template: string, state: any): string {
    const templateInstance = new Template(this.compiler, {})
    const presenter = new Presenter(state)
    return templateInstance.render(template, presenter)
  }
}
