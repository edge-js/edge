/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { IPresenter } from '../Contracts'

export class Presenter implements IPresenter {
  constructor (public state: any) {
  }
}
