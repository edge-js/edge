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
  public line: number
  constructor (message: string, status: number, code: string, link: string) {
    super(message, status, code, link)
  }
}

export class UnAllowedExpressionException extends BaseException {
  public static invoke (tag: string, expression: string, line: number) {
    const message = `${expression} is not allowed for ${tag} tag`
    const error = new this(message, 500, 'E_UNALLOWED_EXPRESSION', errShLink)
    error.line = line

    throw error
  }
}

export class TooManyArgumentsException extends BaseException {
  public static invoke (tag: string, limit: number, line: number) {
    const message = `Maximum of ${limit} arguments are allowed for ${tag} tag`
    const error = new this(message, 500, 'E_MAX_ARGUMENTS', errShLink)
    error.line = line

    throw error
  }
}
