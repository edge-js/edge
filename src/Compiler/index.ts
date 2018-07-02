/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { ILoader } from '../Contracts'
import { Parser } from 'edge-parser'
import { ITag } from 'edge-parser/build/src/Contracts'

export class Compiler {
  private cache: Map<string, string> = new Map()

  constructor (private loader: ILoader, private tags: { [key: string]: ITag }, private shouldCache: boolean = true) {
  }

  /**
   * Compiles a given template by loading it using the loader
   */
  private _compile (templatePath: string, diskName: string): string {
    const template = this.loader.resolve(templatePath, diskName)
    const parser = new Parser(this.tags)
    return parser.parseTemplate(template)
  }

  /**
   * Compiles a given template by loading it using the loader, also caches
   * the template and returns from the cache (if exists).
   */
  public compile (templatePath: string, diskName: string = 'default'): string {
    templatePath = this.loader.makePath(templatePath, diskName)

    /**
     * Compile right away when cache is disabled
     */
    if (!this.shouldCache) {
      return this._compile(templatePath, diskName)
    }

    /* istanbul ignore else */
    if (!this.cache.get(templatePath)) {
      this.cache.set(templatePath, this._compile(templatePath, diskName))
    }

    return this.cache.get(templatePath)!
  }
}
