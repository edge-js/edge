/**
 * @module edge
 */

/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

export class SuperTag {
  public static block = false
  public static seekable = false
  public static selfclosed = false
  public static tagName = 'super'

  public static compile () {
    // The super tag is handled by the compiler itself. I am just a way to
    // tell lexer to parse me as an inline node
  }
}
