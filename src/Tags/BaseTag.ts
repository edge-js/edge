/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { UnAllowedExpressionException } from '../Exceptions'

export class BaseTag {
  protected bannedExpressions: string[] = []

  private _patchLineNumber (original: number, parsed: number): number {
    return (parsed + original) - 1
  }

  protected _validateExpression ({ type, loc }, lineno: number): void {
    if (this.bannedExpressions.indexOf(type) > -1) {
      const line = this._patchLineNumber(loc.start.line, lineno)
      throw UnAllowedExpressionException.invoke('if', type, { line })
    }
  }
}
