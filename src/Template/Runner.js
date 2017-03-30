'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/**
 * Template runner executes a pre-compiled template.
 * If the pre-compiled file is a javascript module,
 * it will be executed as a function. If it is a
 * function wrapped as a string, then it will
 * executed via `new Function()`.
 *
 * @class TemplateRunner
 */
class TemplateRunner {
  constructor (templateFn, scope) {
    this.templateFn = templateFn
    this.scope = scope
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
     * Throw exception when template is a string and starts
     * with module.exports.
     */
    if (typeof (this.templateFn) === 'string' && this.templateFn.startsWith('module.exports')) {
      throw new Error('Cannot run template string exported as a module. Make sure to compile template with asFunction set to true')
    }

    /**
     * If template fn is a string, make sure to run
     * it inside a scope.
     */
    if (typeof (this.templateFn) === 'string') {
      /* eslint no-new-func: "off" */
      templateFn = new Function(this.templateFn)
    }

    return templateFn.bind(this.scope)()
  }
}

module.exports = TemplateRunner
