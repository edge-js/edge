'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const path = require('path')
const stream = require('stream')
const test = require('japa')
const _ = require('lodash')
const dedent = require('dedent-js')
const Edge = require('../src/Edge')
const Tags = require('../src/Tags')
const Presenter = require('../src/Presenter')

test.group('Edge', () => {
  test('register existing tags on new class instance', (assert) => {
    const edge = new Edge()
    assert.deepEqual(_.map(Tags, (tag) => tag.tagName), Object.keys(edge._tags))
  })

  test('throw exception when a tag does not have a tagName', (assert) => {
    const edge = new Edge()
    const fn = () => edge.tag({})
    assert.throw(fn, 'Cannot register a tag without a tagName, compile and run method')
  })

  test('throw exception when a tag does not have a compile method', (assert) => {
    const edge = new Edge()
    const fn = () => edge.tag({tagName: 'foo'})
    assert.throw(fn, 'Cannot register a tag without a tagName, compile and run method')
  })

  test('throw exception when a tag does not have a run method', (assert) => {
    const edge = new Edge()
    const fn = () => edge.tag({tagName: 'foo', compile: function () {}})
    assert.throw(fn, 'Cannot register a tag without a tagName, compile and run method')
  })

  test('register tag when all requirements have been satiesfied', (assert) => {
    const edge = new Edge()
    edge.tag({tagName: 'foo', compile: function () {}, run: function () {}})
    assert.equal(edge._tags.foo.name, 'foo')
  })

  test('compile raw string', (assert) => {
    const edge = new Edge()
    const statement = '{{ username }}'
    assert.equal(edge.compileString(statement), dedent`
    module.exports = function () {
      let out = new String()
      out += \`\${this.escape(this.resolve('username'))}\\n\`
      return out
    }
    `)
  })

  test('render a raw string', (assert) => {
    const edge = new Edge()
    const statement = '{{ username }}'
    assert.equal(edge.renderString(statement, { username: 'virk' }), 'virk\n')
  })

  test('pass instance of base presenter when no presenter has been defined', (assert) => {
    let presenterInstance = null
    const edge = new Edge()
    const statement = '{{ foo() }}'
    edge.global('foo', function () {
      presenterInstance = this._presenter
    })
    edge.renderString(statement)
    assert.instanceOf(presenterInstance, Presenter)
  })

  test('throw exception when trying to render views without views path', (assert) => {
    const edge = new Edge()
    const output = () => edge.render('hello')
    assert.throw(output, 'Cannot render hello.edge. Make sure to register views path first')
  })

  test('register views path', (assert) => {
    const edge = new Edge()
    const viewsPath = path.join(__dirname, '../test-helpers/views')
    edge.registerViews(viewsPath)
    assert.equal(edge._viewsPath, viewsPath)
  })

  test('throw exception when view does not exists', (assert) => {
    const edge = new Edge()
    const viewsPath = path.join(__dirname, '../test-helpers/views')
    edge.registerViews(viewsPath)
    const output = () => edge.render('hello')
    assert.throw(output, `Cannot render hello.edge. Make sure the file exists at ${viewsPath} location`)
  })

  test('render the file from a location synchronously', (assert) => {
    const edge = new Edge()
    const viewsPath = path.join(__dirname, '../test-helpers/views')
    edge.registerViews(viewsPath)
    const output = edge.render('welcome', { username: 'virk' })
    assert.equal(output, 'virk\n')
  })
})
