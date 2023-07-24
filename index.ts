/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Edge } from './src/edge/index.js'
import { safeValue } from './src/template/index.js'
import { GLOBALS } from './src/edge/globals/index.js'

/**
 * Default export
 */
const edge = new Edge()
Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))
export default edge

export { Edge, safeValue, GLOBALS }
