/*
 * edge.js
 *
 * (c) Edge
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as Tags from './tags/main.js'
import { GLOBALS } from './globals.js'
import type { PluginFn } from '../types.js'

export const migrate: PluginFn<undefined> = (edge) => {
  edge.compat = true
  edge.compiler.compat = true
  edge.asyncCompiler.compat = true
  Object.keys(GLOBALS).forEach((name) => {
    edge.global(name, GLOBALS[name])
  })
  Object.keys(Tags).forEach((name) => {
    edge.registerTag(Tags[name as keyof typeof Tags])
  })
}
