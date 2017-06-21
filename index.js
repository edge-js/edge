'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

exports = module.exports = new (require('./src/Edge'))()
exports.BasePresenter = require('./src/Presenter')
exports.BaseTag = require('./src/Tags/BaseTag')
