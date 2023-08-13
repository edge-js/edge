/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Edge } from '../edge/main.js'
import { PluginFn } from '../types.js'

/**
 * Hooks into the compiler phase of Edge and converts
 * tags to components.
 *
 * The components are discovered from the components directory
 * inside every registered disk.
 */
class SuperChargedComponents {
  #edge: Edge
  #components: Record<string, string> = {}

  constructor(edge: Edge) {
    this.#edge = edge
    this.#claimTags()
    this.#transformTags()
  }

  /**
   * Refreshes the list of components
   */
  refreshComponents() {
    this.#components = this.#edge.loader
      .listComponents()
      .reduce<Record<string, string>>((result, { components }) => {
        components.forEach((component) => {
          result[component.tagName] = component.componentName
        })
        return result
      }, {})
  }

  /**
   * Registers hook to claim self processing of tags that
   * are references to components
   */
  #claimTags() {
    this.#edge.compiler.claimTag((name) => {
      if (this.#components[name]) {
        return { seekable: true, block: true }
      }
      return null
    })

    this.#edge.asyncCompiler.claimTag((name) => {
      if (this.#components[name]) {
        return { seekable: true, block: true }
      }
      return null
    })
  }

  /**
   * Transforms tags to component calls
   */
  #transformTags() {
    this.#edge.processor.process('tag', ({ tag }) => {
      const component = this.#components[tag.properties.name]
      if (!component) {
        return
      }

      tag.properties.name = 'component'
      if (tag.properties.jsArg.trim() === '') {
        tag.properties.jsArg = `'${component}'`
      } else {
        tag.properties.jsArg = `'${component}',${tag.properties.jsArg}`
      }
    })
  }
}

/**
 * The superCharged plugin converts components stored within the
 * components directory of all the disk to Edge tags.
 */
let superCharged: SuperChargedComponents
export const pluginSuperCharged: PluginFn<{ recurring: boolean }> = (edge, firstRun) => {
  if (firstRun) {
    superCharged = new SuperChargedComponents(edge)
  }
  superCharged.refreshComponents()
}
