/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { Edge } from './src/Edge'
import globals from './src/Edge/globals'
export * from './src/Contracts'

const edge = new Edge()
globals(edge)

export default edge
export { Edge }
