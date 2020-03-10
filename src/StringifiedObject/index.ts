/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { Parser } from 'edge-parser'

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

  /**
   * Parses an array of expressions to form an object. Each expression inside the array must
   * be `ObjectExpression` or an `AssignmentExpression`, otherwise it will be ignored.
   *
   * ```js
   * (title = 'hello')
   * // returns { title: 'hello' }
   *
   * ({ title: 'hello' })
   * // returns { title: 'hello' }
   *
   * ({ title: 'hello' }, username = 'virk')
   * // returns { title: 'hello', username: 'virk' }
   * ```
   */
  public static fromAcornExpressions (expressions: any[], parser: Parser): string {
    if (!Array.isArray(expressions)) {
      throw new Error('"fromAcornExpressions" expects an array of acorn ast expressions')
    }

    const objectifyString = new this()

    expressions.forEach((arg) => {
      if (arg.type === 'ObjectExpression') {
        arg.properties.forEach((prop: any) => {
          const key = parser.utils.stringify(prop.key)
          const value = parser.utils.stringify(prop.value)
          objectifyString.add(key, value)
        })
      }

      if (arg.type === 'AssignmentExpression') {
        objectifyString.add(arg.left.name, parser.utils.stringify(arg.right))
      }
    })

    return objectifyString.flush()
  }
}
