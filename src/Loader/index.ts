/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { join } from 'path'
import { readFileSync } from 'fs'

export class Loader {
  private mountedDirs: Map<string, string> = new Map()

  /**
   * Returns an object of mounted directories with their public
   * names
   */
  public get mounted (): object {
    return Array.from(this.mountedDirs).reduce((obj, [key, value]) => {
      obj[key] = value
      return obj
    }, {})
  }

  /**
   * Mount a directory for resolving views
   */
  public mount (name: string, dirPath: string): void {
    this.mountedDirs.set(name, dirPath)
  }

  /**
   * Remove directory from the list of directories
   * for resolving views
   */
  public unmount (name: string): void {
    this.mountedDirs.delete(name)
  }

  /**
   * Resolves a template from disk and returns it as a string
   */
  public resolve (template: string, name: string = 'default'): string {
    const mountedDir = this.mountedDirs.get(name)
    if (!mountedDir) {
      throw new Error(`Attempting to resolve ${template} template for unmounted ${name} location`)
    }

    /**
     * Normalize template name by adding extension
     */
    template = `${template.replace(/\.edge$/, '')}.edge`

    try {
      return readFileSync(join(mountedDir, template), 'utf-8')
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Cannot resolve ${template}. Make sure file exists at ${mountedDir} location.`)
      }
      throw error
    }
  }
}
