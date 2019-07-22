/**
 * @module edge
 */

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { LoaderTemplate } from '../Contracts'

/**
 * In memory cache manager to cache pre-compiled templates
 */
export class CacheManager {
  private _cacheStore: Map<string, LoaderTemplate> = new Map()

  constructor (private _enabled: boolean) {
  }

  /**
   * Returns the template and the presenter class from the
   * cache. If caching is disabled, then it will
   * return undefined.
   */
  public get (absPath: string): undefined | LoaderTemplate {
    if (!this._enabled) {
      return
    }

    return this._cacheStore.get(absPath)
  }

  /**
   * Set's the template path and the payload to the cache. If
   * cache is disabled, then this function returns in noop.
   */
  public set (absPath: string, payload: LoaderTemplate) {
    if (!this._enabled) {
      return
    }

    this._cacheStore.set(absPath, payload)
  }
}
