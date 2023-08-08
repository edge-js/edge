/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import lodash from '@poppinss/utils/lodash'

import { htmlSafe } from '../template.js'
import { PropsContract } from '../types.js'
import { stringifyAttributes } from '../utils.js'

/**
 * Class to ease interactions with component props
 */
export class Props implements PropsContract {
  constructor(props: any) {
    // @ts-ignore
    this[Symbol.for('options')] = { props }
    Object.assign(this, props)
  }

  /**
   * Merges the className attribute with the class attribute
   */
  #mergeClassAttributes(props: any) {
    if (props.className) {
      if (!props.class) {
        props.class = []
      }

      /**
       * Normalize class attribute to be an array
       */
      if (!Array.isArray(props.class)) {
        props.class = [props.class]
      }

      props.class = props.class.concat(props.className)
      props.className = false
    }

    return props
  }

  /**
   * Find if a key exists inside the props
   */
  has(key: string) {
    const value = this.get(key)
    return value !== undefined && value !== null
  }

  /**
   * Get value for a given key
   */
  get(key: string, defaultValue?: any) {
    return lodash.get(this.all(), key, defaultValue)
  }

  /**
   * Returns all the props
   */
  all() {
    // @ts-ignore
    return this[Symbol.for('options')].props
  }

  /**
   * Validate prop value
   */
  validate(key: string, validateFn: (key: string, value?: any) => any) {
    const value = this.get(key)
    validateFn(key, value)
  }

  /**
   * Return values for only the given keys
   */
  only(keys: string[]) {
    return lodash.pick(this.all(), keys)
  }

  /**
   * Return values except the given keys
   */
  except(keys: string[]) {
    return lodash.omit(this.all(), keys)
  }

  /**
   * Serialize all props to a string of HTML attributes
   */
  serialize(mergeProps?: any, prioritizeInline: boolean = true) {
    /**
     * Prioritize user attributes when prioritizeInline=false
     */
    const attributes = prioritizeInline
      ? lodash.merge({}, this.all(), mergeProps)
      : lodash.merge({}, mergeProps, this.all())

    return htmlSafe(stringifyAttributes(this.#mergeClassAttributes(attributes)))
  }

  /**
   * Serialize only the given keys to a string of HTML attributes
   */
  serializeOnly(keys: string[], mergeProps?: any, prioritizeInline: boolean = true) {
    /**
     * Prioritize user attributes when prioritizeInline=false
     */
    const attributes = prioritizeInline
      ? lodash.merge({}, this.only(keys), mergeProps)
      : lodash.merge({}, mergeProps, this.only(keys))

    return htmlSafe(stringifyAttributes(this.#mergeClassAttributes(attributes)))
  }

  /**
   * Serialize except the given keys to a string of HTML attributes
   */
  serializeExcept(keys: string[], mergeProps?: any, prioritizeInline: boolean = true) {
    /**
     * Prioritize user attributes when prioritizeInline=false
     */
    const attributes = prioritizeInline
      ? lodash.merge({}, this.except(keys), mergeProps)
      : lodash.merge({}, mergeProps, this.except(keys))

    return htmlSafe(stringifyAttributes(this.#mergeClassAttributes(attributes)))
  }
}
