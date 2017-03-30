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
module.exports = function (scope, Tags) {
  scope.tags = _.transform(Tags, (result, tag) => {
    result[tag.tagName] = {
      name: tag.tagName,
      isBlock: tag.isBlock,
      compile: tag.compile.bind(tag),
      run: tag.run.bind(tag)
    }
    return result
  }, {})
}
