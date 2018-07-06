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
  private _compile (templatePath: string, inline: boolean = false): string {
    const template = this.loader.resolve(templatePath)
    const parser = new Parser(this.tags)
    return parser.parseTemplate(template, !inline)
  }

  /**
   * Compiles a given template by loading it using the loader, also caches
   * the template and returns from the cache (if exists).
   */
  public compile (templatePath: string, inline: boolean = false): string {
    templatePath = this.loader.makePath(templatePath)

    /**
     * Compile right away when cache is disabled
     */
    if (!this.shouldCache) {
      return this._compile(templatePath, inline)
    }

    /* istanbul ignore else */
    if (!this.cache.get(templatePath)) {
      this.cache.set(templatePath, this._compile(templatePath, inline))
    }

    return this.cache.get(templatePath)!
  }
}
