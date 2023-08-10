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
import { stringifyAttributes } from '../utils.js'

/**
 * Representation of component props with ability to serialize
 * them into HTML attributes
 */
export class ComponentProps {
  #values: Record<string, any>

  constructor(values: Record<string, any>) {
    this.#values = values
  }

  /**
   * Reference to props raw values
   */
  all() {
    return this.#values
  }

  /**
   * Check if a key exists
   */
  has(key: string) {
    return lodash.has(this.#values, key)
  }

  /**
   * Get key value
   */
  get(key: string, defaultValue?: any) {
    return lodash.get(this.#values, key, defaultValue)
  }

  /**
   * Returns a new props bag with only the mentioned keys
   */
  only(keys: string[]) {
    return new ComponentProps(lodash.pick(this.#values, keys))
  }

  /**
   * Returns a new props bag with except the mentioned keys
   */
  except(keys: string[]) {
    return new ComponentProps(lodash.omit(this.#values, keys))
  }

  /**
   * Define defaults for the props values.
   *
   * - All other attributes will be overwritten when defined in props
   * - Classes will be merged together.
   */
  defaults(values: Record<string, any>) {
    if (values.class && this.#values['class']) {
      const classes = { ...values.class, ...this.#values.class }
      return new ComponentProps({ ...values, ...this.#values, class: classes })
    }

    return new ComponentProps({ ...values, ...this.#values })
  }

  /**
   * Converts props to HTML attributes
   */
  toAttrs() {
    return htmlSafe(stringifyAttributes(this.#values))
  }
}
