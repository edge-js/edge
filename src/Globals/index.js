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

const range = function (start, end) {
  return _.range(start, end)
}

const batch = function (input, size) {
  return _.chunk(input, size)
}

const toJSON = function (input, indent = 2) {
  return JSON.stringify(input, null, indent)
}

const first = function (collection) {
  return _.first(collection)
}

const last = function (collection) {
  return _.last(collection)
}

const groupBy = function (collection, field) {
  return _.groupBy(collection, field)
}

const size = function (input) {
  return _.size(input)
}

module.exports = {
  range,
  batch,
  toJSON,
  first,
  last,
  groupBy,
  size
}
