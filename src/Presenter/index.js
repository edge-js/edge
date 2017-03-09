'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')

/**
 * The base presenter class to be used for creating
 * custom presenters. It simply merges the data
 * and locals together and set `$data` property
 * to be consumed by context internally.
 *
 * @class BasePresenter
 */
class BasePresenter {
  constructor (data, locals) {
    this.$data = _.merge(locals, data)
  }
}

module.exports = BasePresenter
