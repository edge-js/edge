/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { Edge } from './src/Edge'

export {
  LoaderContract,
  LoaderTemplate,
  EdgeContract,
  EdgeRendererContract,
  ContextContract,
  ContextConstructorContract,
  TagContract,
  CompilerContract,
} from './src/Contracts'

export {
  disAllowExpressions,
  allowExpressions,
  extractDiskAndTemplateName,
} from './src/utils'

export { Edge }

const edge = new Edge()
export default edge
