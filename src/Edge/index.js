'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const TemplateCompiler = require('../Template/Compiler')
const TemplateRunner = require('../Template/Runner')
const Context = require('../Context')
const ExistingTags = require('../Tags')

class Edge {
  constructor () {
    this._templates = []
    this._defaultLocation = null
    this._mountedPaths = []
    this._tags = {}
    _.each(ExistingTags, this.tag.bind(this))
  }

  /**
   * Register a tag to the template engine. Make
   * sure tag has following properties.
   *
   * 1. tagName
   * 2. compile
   * 3. run
   *
   * @method tag
   *
   * @param  {Object}    tag
   *
   * @chainable
   *
   * @throws {InvalidTag} If tag does not have all the required properties
   */
  tag (tag) {
    if (!tag.tagName || !tag.compile || !tag.run) {
      throw new Error('Invalid tag')
    }
    this._tags[tag.tagName] = tag

    /**
     * This is the place where tags can add their own logic
     */
    tag.run(Context)
    return this
  }

  /**
   * Mount a location from where to load views.
   *
   * @method mountDefault
   *
   * @param  {String}     location
   *
   * @chainable
   */
  mountDefault (location) {
    this._defaultLocation = location
    return this
  }

  /**
   * Mount key/value pairs to load templates
   * from a given location.
   *
   * @method mount
   *
   * @param  {String} name
   * @param  {String} location
   *
   * @chainable
   */
  mount (name, location) {
    this._mountedPaths.push({ name, location })
    return this
  }

  compile (templatePath) {
    templatePath = `${templatePath.replace('.edge', '')}.edge`
    const contents = fs.readFileSync(path.join(this._defaultLocation, templatePath), 'utf-8')
    return this.compileString(contents)
  }

  compileString (template) {
    return new TemplateCompiler(this._tags, template).compile()
  }

  _renderSync (templatePath, data) {
    const compiledTemplate = this.compile(templatePath)
    return new TemplateRunner(compiledTemplate, data).run()
  }

  render (templatePath, data, outputStream) {
    if (!outputStream) {
      return this._renderSync(templatePath, data)
      return
    }
  }
}

module.exports = Edge
