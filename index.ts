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
import globals from './src/Edge/globals'

const edge = new Edge()
globals(edge)

export { Edge }
export default edge
export { safeValue, withCtx } from './src/Context'
