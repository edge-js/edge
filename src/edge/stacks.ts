/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EOL } from 'node:os'

export default class Stacks {
  /**
   * Pre-seeded content before the placeholder has been
   * defined.
   */
  #seededPlaceholders: Map<string, string[]> = new Map()

  /**
   * Placeholders to be flushed
   */
  #placeholders: Map<string, string[]> = new Map()

  /**
   * Returns the placeholder name for a given stack
   */
  #createPlaceholder(name: string) {
    return `<!-- @edge.stacks.${name} -->`
  }

  /**
   * Create a new stack placeholder. Multiple calls to this method
   * with the same name results in an exception.
   */
  create(name: string) {
    if (this.#placeholders.has(name)) {
      throw new Error(`Cannot declare stack "${name}" for multiple times`)
    }

    /**
     * Copy content from the seeded placeholders and delete it
     */
    const seededPlaceholder = this.#seededPlaceholders.get(name) || []
    this.#seededPlaceholders.delete(name)

    this.#placeholders.set(name, [...seededPlaceholder])
    return this.#createPlaceholder(name)
  }

  /**
   * Push content inside a given stack. Content can be pre-seeded
   * without creating a stack
   */
  pushTo(name: string, contents: string) {
    let placeholder = this.#placeholders.get(name)

    if (!placeholder) {
      if (!this.#seededPlaceholders.has(name)) {
        this.#seededPlaceholders.set(name, [])
      }
      const seededPlaceholder = this.#seededPlaceholders.get(name)!
      seededPlaceholder.push(contents)
      return this
    }

    /**
     * Defined content for the unique key inside a given
     * stack
     */
    placeholder.push(contents)
    return this
  }

  /**
   * Fill placeholders with their actual content
   */
  fillPlaceholders(contents: string) {
    for (let [name, sources] of this.#placeholders) {
      contents = contents.replace(this.#createPlaceholder(name), sources.join(EOL))
    }

    this.#placeholders.clear()
    this.#seededPlaceholders.clear()
    return contents
  }
}
