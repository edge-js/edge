/**
 * @module main
 */

/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { PresenterContract } from '../Contracts'

/**
 * The Base presenter is passed to context for reading
 * the state values.
 *
 * However, a custom presenter a do a lot by defining
 * custom properties and methods.
 */
export class Presenter implements PresenterContract {
  constructor (public state: any) {
  }
}
