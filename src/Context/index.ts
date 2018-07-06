/*
* edge.js
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as Macroable from 'macroable'
import * as he from 'he'
import { set } from 'lodash'
import { IPresenter } from '../Contracts'

export class Context extends Macroable {
  /* tslint:disable-next-line */
  private static _macros: object = {}

  /* tslint:disable-next-line */
  private static _getters: object = {}

  /**
   * Remove all macros and getters
   */
  public static hydrate () {
    super.hydrate()
  }

  /**
   * Define macro on the context
   */
  public static macro (name: string, callback: Function) {
    super.macro(name, callback)
  }

  /**
   * Define getter on the context
   */
  public static getter (name: string, callback: Function, singleton: boolean = false) {
    super.getter(name, callback, singleton)
  }

  /**
   * Frames are used to define a inner scope in which values will
   * be resolved. The resolve function starts with the deepest
   * frame and then resolve the value up until the first
   * frame.
   */
  private frames: any[] = []

  constructor (public presenter: IPresenter, public sharedState: object) {
    super()
  }

  /**
   * Creates a new frame object.
   */
  public newFrame (): void {
    this.frames.unshift({})
  }

  /**
   * Set key/value pair on the frame object
   */
  public setOnFrame (key: string, value: any): void {
    const recentFrame = this.frames[0]

    if (!recentFrame) {
      throw new Error('Make sure to call {newFrame} before calling {setOnFrame}')
    }

    set(recentFrame, key, value)
  }

  /**
   * Removes the most recent frame
   */
  public removeFrame (): void {
    this.frames.shift()
  }

  /**
   * Escapes the value to be HTML safe
   */
  public escape <T> (input: T): T {
    return typeof (input) === 'string' ? he.escape(input) : input
  }

  /**
   * Resolves value for a given key. It will look for the value in different
   * stores and continues till the end if `undefined` is returned.
   *
   * 1. Check for value inside frames
   * 2. Then on the presenter instance
   * 3. Then the presenter `state` object
   * 4. Finally fallback to the sharedState
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
   * Set/update value inside the context. If this method
   * is called inside the `frame` scope, then value is
   * created on the frame and not the presenter state
   */
  public set (key: string, value: any): void {
    if (this.frames.length) {
      this.setOnFrame(key, value)
      return
    }

    set(this.presenter.state, key, value)
  }

  /**
   * Returns value for a key inside frames. Stops looking for it,
   * when value is found inside the first frame
   */
  private getFromFrame (key: string): any {
    const frameWithVal = this.frames.find((frame) => frame[key] !== undefined)
    return frameWithVal ? frameWithVal[key] : undefined
  }
}
