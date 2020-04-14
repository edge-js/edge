/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

export * from './src/Contracts'
import { Edge } from './src/Edge'
import { safeValue } from './src/Context'
import { GLOBALS } from './src/Edge/globals'

/**
 * Default export
 */
const edge = new Edge()
Object.keys(GLOBALS).forEach((key) => edge.global(key, GLOBALS[key]))
export default edge

export { Edge, safeValue, GLOBALS }
