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
const encodeurl = require('encodeurl')

/**
 * Returns an array of numbers with in
 * the defined range
 *
 * @method range
 *
 * @param  {Number} [start = 0]
 * @param  {Number} end
 * @param  {Number} [step=1]
 *
 * @return {Array}
 */
const range = function (start, end) {
  return _.range(start, end)
}

/**
 * Converts an array into batch of multiple
 * arrays.
 *
 * @method batch
 *
 * @param  {Array} input
 * @param  {Number} size
 *
 * @return {Array}
 *
 * @example
 * ```
 * [1, 2, 3, 4]
 * // returns
 * [[1, 2], [3, 4]]
 * ```
 */
const batch = function (input, size) {
  return _.chunk(input, size)
}

/**
 * Convert an object to JSON string via
 * JSON.stringify
 *
 * @method toJSON
 *
 * @param  {Object} input
 * @param  {Number} indent
 *
 * @return {String}
 */
const toJSON = function (input, indent = 2) {
  return JSON.stringify(input, null, indent)
}

/**
 * Returns the 1st item from an array
 *
 * @method first
 *
 * @param  {Array} collection
 *
 * @return {Mixed}
 */
const first = function (collection) {
  return _.first(collection)
}

/**
 * Returns the last item from an array
 *
 * @method last
 *
 * @param  {Array} collection
 *
 * @return {Mixed}
 */
const last = function (collection) {
  return _.last(collection)
}

/**
 * Groupby a collection with some field name
 *
 * @method groupBy
 *
 * @param  {Array} collection
 * @param  {String|Number|Function} field
 *
 * @return {Array}
 */
const groupBy = function (collection, field) {
  return _.groupBy(collection, field)
}

/**
 * Returns the size of an element. Parsers
 * arrays and strings
 *
 * @method size
 *
 * @param  {Array|String} input
 *
 * @return {Number}
 */
const size = function (input) {
  return _.size(input)
}

/**
 * Returns an element by replacing dynamic values
 * inside it. It is very simple to print an
 * HTML string inside shorthand if statemnt.
 *
 * @method el
 *
 * @param  {String} htmlStr
 * @param  {Object} hash
 *
 * @return {Object} - Instance of safe string
 *
 * @example
 * ```
 * this.el('<a href="$url"> $title </a>', { title: 'Docs', url: '/docs' })
 * // returns
 * // '<a href="/docs"> Docs </a>'
 * ```
 */
const el = function (htmlStr, hash) {
  return this.safe(htmlStr.replace(/\$([\w.-]+)/g, (match, group) => {
    return group === 'self' ? hash : _.get(hash, _.toPath(group))
  }))
}

/**
 * Return element only when the 3rd param
 * is true.
 *
 * @method elIf
 *
 * @param  {String} htmlStr
 * @param  {Object} hash
 * @param  {Boolean} ifResult
 *
 * @return {String}
 */
const elIf = function (htmlStr, hash, ifResult) {
  if (!ifResult) {
    return ''
  }

  return this.safe(htmlStr.replace(/\$([\w.-]+)/g, (match, group) => {
    return group === 'self' ? hash : _.get(hash, _.toPath(group))
  }))
}

/**
 * Convert a string to camelcase
 *
 * @method camelCase
 *
 * @param  {String}  input
 *
 * @return {String}
 */
const camelCase = function (input) {
  return _.camelCase(input)
}

/**
 * Capitalize a string.
 *
 * @method upperCase
 *
 * @param  {String}  input
 *
 * @return {String}
 */
const upperCase = function (input) {
  return _.upperCase(input)
}

/**
 * Lowercase a string.
 *
 * @method lowerCase
 *
 * @param  {String}  input
 *
 * @return {String}
 */
const lowerCase = function (input) {
  return _.lowerCase(input)
}

/**
 * Lowercase the first character in string.
 *
 * @method lowerFirst
 *
 * @param  {String}  input
 *
 * @return {String}
 */
const lowerFirst = function (input) {
  return _.lowerFirst(input)
}

/**
 * Upercase the first character in string.
 *
 * @method upperFirst
 *
 * @param  {String}  input
 *
 * @return {String}
 */
const upperFirst = function (input) {
  return _.upperFirst(input)
}

/**
 * Capitalize each first word of a string
 *
 * @method capitalize
 *
 * @param  {String}   input
 *
 * @return {String}
 */
const capitalize = function (input) {
  return _.startCase(input)
}

/**
 * Truncate a string to given number to characters
 *
 * @method truncate
 *
 * @param  {String} input
 * @param  {Number} limitTo
 * @param  {String} [omission = ...]
 *
 * @return {String}
 */
const truncate = function (input, limitTo, omission) {
  return _.truncate(input, {
    length: limitTo,
    omission: omission
  })
}

/**
 * Converts a plain url to an anchor tag
 *
 * @method toAnchor
 *
 * @param  {String} url
 * @param  {Sting} title
 *
 * @return {Object} - Instance of safe object
 */
const toAnchor = function (url, title = url) {
  return this.safe(`<a href="${url}"> ${title} </a>`)
}

/**
 * Encodes a url
 *
 * @method urlEncode
 *
 * @param  {String}  url
 *
 * @return {String}
 */
const urlEncode = function (url) {
  return encodeurl(url)
}

/**
 * Order an array using a given property.
 *
 * @method orderBy
 *
 * @param {Array} collection
 * @param {String|Array} property
 * @param {String|Array} order
 */
const orderBy = function (collection, property, order) {
  return _.orderBy(collection, property, order)
}

module.exports = {
  range,
  batch,
  toJSON,
  first,
  last,
  groupBy,
  size,
  el,
  elIf,
  camelCase,
  upperCase,
  upperFirst,
  lowerCase,
  lowerFirst,
  capitalize,
  truncate,
  toAnchor,
  urlEncode,
  orderBy
}
