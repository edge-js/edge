/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { LoaderTemplate, CacheManagerContract } from '../Contracts'

/**
 * In memory cache manager to cache pre-compiled templates.
 */
export class CacheManager implements CacheManagerContract {
  private cacheStore: Map<string, LoaderTemplate> = new Map()

  constructor(public enabled: boolean) {}

  /**
   * Returns a boolean to tell if a template has already been cached
   * or not.
   */
  public has(absPath: string): boolean {
    return this.cacheStore.has(absPath)
  }

  /**
   * Returns the template from the cache. If caching is disabled,
   * then it will return undefined.
   */
  public get(absPath: string): undefined | LoaderTemplate {
    if (!this.enabled) {
      return
    }

    return this.cacheStore.get(absPath)
  }

  /**
   * Set's the template path and the payload to the cache. If
   * cache is disabled, then this function results in a noop.
   */
  public set(absPath: string, payload: LoaderTemplate) {
    if (!this.enabled) {
      return
    }

    this.cacheStore.set(absPath, payload)
  }
}
