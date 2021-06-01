/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { lodash } from '@poppinss/utils'
import stringifyAttributes from 'stringify-attributes'

import { safeValue } from '../Template'
import { PropsContract } from '../Contracts'

/**
 * Class to ease interactions with component props
 */
export class Props implements PropsContract {
  constructor(props: any) {
    this[Symbol.for('options')] = { props }
    Object.assign(this, props)
  }

  /**
   * Merges the className attribute with the class attribute
   */
  private mergeClassAttributes(props: any) {
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
  public has(key: string) {
    const value = this.get(key)
    return value !== undefined && value !== null
  }

  /**
   * Get value for a given key
   */
  public get(key: string, defaultValue?: any) {
    return lodash.get(this.all(), key, defaultValue)
  }

  /**
   * Returns all the props
   */
  public all() {
    return this[Symbol.for('options')].props
  }

  /**
   * Validate prop value
   */
  public validate(key: string, validateFn: (key: string, value?: any) => any) {
    const value = this.get(key)
    validateFn(key, value)
  }

  /**
   * Return values for only the given keys
   */
  public only(keys: string[]) {
    return lodash.pick(this.all(), keys)
  }

  /**
   * Return values except the given keys
   */
  public except(keys: string[]) {
    return lodash.omit(this.all(), keys)
  }

  /**
   * Serialize all props to a string of HTML attributes
   */
  public serialize(mergeProps?: any, priortizeInline: boolean = true) {
    /**
     * Priortize user attributes when priortizeInline=false
     */
    const attributes = priortizeInline
      ? lodash.merge({}, this.all(), mergeProps)
      : lodash.merge({}, mergeProps, this.all())

    return safeValue(stringifyAttributes(this.mergeClassAttributes(attributes)))
  }

  /**
   * Serialize only the given keys to a string of HTML attributes
   */
  public serializeOnly(keys: string[], mergeProps?: any, priortizeInline: boolean = true) {
    /**
     * Priortize user attributes when priortizeInline=false
     */
    const attributes = priortizeInline
      ? lodash.merge({}, this.only(keys), mergeProps)
      : lodash.merge({}, mergeProps, this.only(keys))

    return safeValue(stringifyAttributes(this.mergeClassAttributes(attributes)))
  }

  /**
   * Serialize except the given keys to a string of HTML attributes
   */
  public serializeExcept(keys: string[], mergeProps?: any, priortizeInline: boolean = true) {
    /**
     * Priortize user attributes when priortizeInline=false
     */
    const attributes = priortizeInline
      ? lodash.merge({}, this.except(keys), mergeProps)
      : lodash.merge({}, mergeProps, this.except(keys))

    return safeValue(stringifyAttributes(this.mergeClassAttributes(attributes)))
  }
}
