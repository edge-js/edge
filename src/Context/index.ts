/*
* edge.js
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import he from 'he'
import { set, get } from 'lodash'
import { Macroable } from 'macroable'
import { EdgeError } from 'edge-error'
import { Presenter } from '../Presenter'
import { ContextContract } from '../Contracts'

/**
 * An instance of this class passed to the escape
 * method ensures that underlying value is never
 * escaped.
 */
export class SafeValue {
  constructor (public value: any) {}
}

/**
 * Context is used at runtime to resolve values for a given
 * template.
 *
 * Also the context can be extended to add `getters` and `methods`. Checkout
 * [macroable](https://github.com/poppinss/macroable) for same.
 */
export class Context extends Macroable implements ContextContract {
  /**
   * Frames are used to define a inner scope in which values will
   * be resolved. The resolve function starts with the deepest
   * frame and then resolve the value up until the first
   * frame.
   */
  private frames: any[] = []

  /**
   * We keep a reference to the last resolved key and use it inside
   * the `reThrow` method.
   */
  private lastResolvedKey = ''

  /**
   * Required by Macroable
   */
  protected static macros = {}
  protected static getters = {}

  /**
   * Added by compiler
   */
  public $filename = ''
  public $lineNumber = 0

  constructor (public presenter: Presenter) {
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
   * Returns a merged copy of the current state. The objects are merged
   * in the same order as they are resolved.
   */
  private getCurrentState () {
    return Object.assign(
      {},
      this.presenter.sharedState,
      this.presenter.state,
      ...this.frames,
    )
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
   * Set key/value pair on the frame object. The value will only be available til
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
      throw new Error('Make sure to call "newFrame" before calling "setOnFrame"')
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
   * Returns all the frames
   */
  public getFrames () {
    return this.frames
  }

  /**
   * Mark output as safe
   */
  public safe <T extends any> (value: T) {
    return new SafeValue(value)
  }

  /**
   * Escapes the value to be HTML safe. Only strings are escaped
   * and rest all values will be returned as it is.
   */
  public escape <T> (input: T): T {
    return typeof (input) === 'string'
      ? he.escape(input)
      : (input instanceof SafeValue ? input.value : input)
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
    this.lastResolvedKey = key

    /**
     * A special key to return the template current state
     */
    if (key === '$state') {
      return this.getCurrentState()
    }

    /**
     * A special key to return the filename of the current execution
     * scope.
     */
    if (key === '$filename') {
      return this.$filename
    }

    /**
     * A special key to return the current execution line number pointing
     * fowards the original template file.
     */
    if (key === '$lineNumber') {
      return this.$lineNumber
    }

    let value: any

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
     * Finally fallback to shared globals
     */
    value = this.presenter.sharedState[key]
    return typeof (value) === 'function' ? value.bind(this.presenter.sharedState) : value
  }

  /**
   * Set/Update the value in the context. The value is defined in the following
   * order.
   *
   * 1. If the scope is inside a frame, then will be created/updated on the frame.
   * 2. Otherwise, the value is created on the presenter state.
   *
   * ```js
   * ctx.set('username', 'virk')
   * ```
   */
  public set (key: string, value: any, isolated: boolean = false): void {
    /**
     * Set value on the presenter state if it already exists and user
     * doesn't want an isolated state for the current frame scope
     */
    if (get(this.presenter.state, key) !== undefined && !isolated) {
      set(this.presenter.state, key, value)
      return
    }

    /**
     * If frames exists, then set the value on the framework
     */
    if (this.frames.length) {
      this.setOnFrame(key, value)
      return
    }

    /**
     * Otherwise set on presenter
     */
    set(this.presenter.state, key, value)
  }

  /**
   * Rethrows the runtime exception by re-constructing the error message
   * to point back to the original filename
   */
  public reThrow (error: any) {
    const message = error.message.replace(/ctx\.resolve\(\.\.\.\)/, this.lastResolvedKey)
    throw new EdgeError(message, 'E_RUNTIME_EXCEPTION', {
      filename: this.$filename,
      line: this.$lineNumber,
      col: 0,
    })
  }
}
