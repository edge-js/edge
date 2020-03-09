/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/**
 * This class generates a valid object as a string, which is written to the template
 * output. The reason we need a string like object, since we don't want it's
 * properties to be evaluated during the object creation, instead it must
 * be evaluated when the compiled output is invoked.
 */
export class StringifiedObject {
  private obj: string = ''

  /**
   * Add key/value pair to the object.
   *
   * ```js
   * stringifiedObject.add('username', `'virk'`)
   * ```
   */
  public add (key: any, value: any) {
    this.obj += this.obj.length ? `, ${key}: ${value}` : `${key}: ${value}`
  }

  /**
   * Returns the object alike string back.
   *
   * ```js
   * stringifiedObject.flush()
   *
   * // returns
   * `{ username: 'virk' }`
   * ```
   */
  public flush (): string {
    const obj = `{ ${this.obj} }`
    this.obj = ''
    return obj
  }
}
