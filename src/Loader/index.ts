/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { join, isAbsolute } from 'path'
import { readFileSync } from 'fs'
import { ILoader } from '../Contracts'

export class Loader implements ILoader {
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
  public mount (diskName: string, dirPath: string): void {
    this.mountedDirs.set(diskName, dirPath)
  }

  /**
   * Remove directory from the list of directories
   * for resolving views
   */
  public unmount (diskName: string): void {
    this.mountedDirs.delete(diskName)
  }

  public makePath (templatePath: string, diskName: string): string {
    const mountedDir = this.mountedDirs.get(diskName)
    if (!mountedDir) {
      throw new Error(`Attempting to resolve ${templatePath} template for unmounted ${diskName} location`)
    }

    /**
     * Normalize template name by adding extension
     */
    templatePath = `${templatePath.replace(/\.edge$/, '')}.edge`
    return join(mountedDir, templatePath)
  }

  /**
   * Resolves a template from disk and returns it as a string
   */
  public resolve (templatePath: string, diskName: string): string {
    try {
      templatePath = isAbsolute(templatePath) ? templatePath : this.makePath(templatePath, diskName)
      return readFileSync(templatePath, 'utf-8')
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Cannot resolve ${templatePath}. Make sure file exists.`)
      } else {
        throw error
      }
    }
  }
}
