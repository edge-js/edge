/**
 * @module edge
 */

/*
* edge.js
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as he from 'he'
import { set } from 'lodash'
import { Macroable } from 'macroable'

/**
 * Context is used at runtime to resolve values for a given
 * template.
 *
 * Also the context can be extended to add `getters` and `methods`. Checkout
 * [macroable](https://github.com/poppinss/macroable) for same.
 */
export class Context extends Macroable {
  protected static _macros = {}
  protected static _getters = {}

  /**
   * Frames are used to define a inner scope in which values will
   * be resolved. The resolve function starts with the deepest
   * frame and then resolve the value up until the first
   * frame.
   */
  private frames: any[] = []

  constructor (public presenter: any, public sharedState: any) {
    super()
  }

  /**
   * Returns value for a key inside frames. Stops looking for it,
   * when value is found inside any frame.
   */
  private getFromFrame (key: string): any {
    const frameWithVal = this.frames.find((frame) => frame[key] !== undefined)
    return frameWithVal ? frameWithVal[key] : undefined
  }

  /**
   * Creates a new frame scope. Think of a scope as a Javacript block
   * scope, where variables defined inside the scope are only available
   * to that scope.
   *
   * ```js
   * ctx.newFrame()
   * ```
   */
  public newFrame (): void {
    this.frames.unshift({})
  }

  /**
   * Set key/value pair on the frame object. The value will only be available until
   * the `removeFrame` is not called.
   *
   * ```js
   * ctx.setOnFrame('username', 'virk')
   *
   * // nested values
   * ctx.setOnFrame('user.username', 'virk')
   * ```
   *
   * @throws Error if no frame scopes exists.
   */
  public setOnFrame (key: string, value: any): void {
    const recentFrame = this.frames[0]

    if (!recentFrame) {
      throw new Error('Make sure to call {newFrame} before calling {setOnFrame}')
    }

    set(recentFrame, key, value)
  }

  /**
   * Removes the most recent frame/scope. All values set inside the
   * frame via `setOnFrame` will be removed.
   */
  public removeFrame (): void {
    this.frames.shift()
  }

  /**
   * Escapes the value to be HTML safe. Only strings are escaped
   * and rest all values will be returned as it is.
   */
  public escape <T> (input: T): T {
    return typeof (input) === 'string' ? he.escape(input) : input
  }

  /**
   * Resolves value for a given key. It will look for the value in different
   * locations and continues till the end if `undefined` is returned at
   * each step.
   *
   * The following steps are followed in the same order as defined.
   *
   * 1. Check for value inside frames.
   * 2. Then on the presenter instance.
   * 3. Then the presenter `state` object.
   * 4. Finally fallback to the sharedState.
   *
   * @example
   * ```js
   * ctx.resolve('username')
   * ```
   */
  public resolve (key: string): any {
    let value

    /**
     * Pull from one of the nested frames
     */
    value = this.getFromFrame(key)
    if (value !== undefined) {
      return typeof (value) === 'function' ? value.bind(this) : value
    }

    /**
     * Check for value as a property on the presenter
     * itself.
     */
    value = this.presenter[key]
    if (value !== undefined) {
      return typeof (value) === 'function' ? value.bind(this.presenter) : value
    }

    /**
     * Otherwise look into presenter state
     */
    value = this.presenter.state[key]
    if (value !== undefined) {
      return typeof (value) === 'function' ? value.bind(this.presenter.state) : value
    }

    /**
     * Finally fallback to defined globals
     */
    value = this.sharedState[key]
    return typeof (value) === 'function' ? value.bind(this.sharedState) : value
  }

  /**
   * Set/Update the value in the context. The value is defined in the following
   * order.
   *
   * 1. If the value already exists on the presenter state, then it will be updated
   * 2. If the scope is inside a frame, then will be created/updated on the frame.
   * 3. At last, the value is created on the presenter state.
   *
   * ```js
   * ctx.set('username', 'virk')
   * ```
   */
  public set (key: string, value: any): void {
    /**
     * If value already exists on the presenter
     * state, then mutate it first
     */
    if (this.presenter.state[key] !== undefined || !this.frames.length) {
      set(this.presenter.state, key, value)
      return
    }

    /**
     * If frames exists, then set it on frame
     */
    this.setOnFrame(key, value)
  }
}
