/**
 * @module tags
 */

/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

export class LayoutTag {
  public static block = false
  public static seekable = true
  public static selfclosed = false
  public static tagName = 'layout'

  public static compile () {
    // The layouts are handled by the template itself. I am just a way to
    // tell lexer to parse me as a block node
  }
}
