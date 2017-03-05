'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const vm = require('vm')
const _ = require('lodash')
const Context = require('../Context')

class TemplateRunner {
  constructor (templateFn, data) {
    this.templateFn = templateFn
    this.context = new Context(data)
  }

  /**
   * Runs the template by properly calling the exported
   * fn on the compiled template.
   *
   * @method run
   *
   * @return {String}
   */
  run () {
    let templateFn = this.templateFn

    /**
     * If template fn is a string, make sure to run
     * it inside a context.
     */
    if (typeof (this.templateFn) === 'string') {
      templateFn = vm.runInNewContext(this.templateFn, { module: module })
    }

    return templateFn.bind(this.context)()
  }
}

module.exports = TemplateRunner
