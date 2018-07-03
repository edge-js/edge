/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as NE from 'node-exceptions'
const errShLink = 'poppinss/edge-errors'

class BaseException extends NE.LogicalException {
  public loc: any
  constructor (message, status, code, link) {
    super(message, status, code, link)
  }
}

export class UnAllowedExpressionException extends BaseException {
  public static invoke (tag, expression, loc) {
    const message = `${expression} is not allowed for ${tag} tag`
    const error = new this(message, 500, 'E_UNALLOWED_EXPRESSION', errShLink)
    error.loc = loc

    throw error
  }
}
