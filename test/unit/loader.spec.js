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
const test = require('japa')
const Loader = require('../../src/Loader')

test.group('Loader', () => {
  test('register view path', (assert) => {
    const viewsPath = path.join(__dirname, './')
    const loader = new Loader(viewsPath)
    assert.equal(loader._viewsPath, viewsPath)
  })

  test('set views path after instantiating the loader', (assert) => {
    const viewsPath = path.join(__dirname, './')
    const loader = new Loader()
    loader.viewsPath = viewsPath
    assert.equal(loader._viewsPath, viewsPath)
  })

  test('register presenters path', (assert) => {
    const viewsPath = path.join(__dirname, './')
    const loader = new Loader(viewsPath, viewsPath)
    assert.equal(loader._presentersPath, viewsPath)
  })

  test('set presenters path after instantiating the loader', (assert) => {
    const viewsPath = path.join(__dirname, './')
    const loader = new Loader()
    loader.presentersPath = viewsPath
    assert.equal(loader.presentersPath, viewsPath)
  })

  test('set compiled directory', (assert) => {
    const viewsPath = path.join(__dirname, './')
    const loader = new Loader()
    loader.compiledDir = viewsPath
    assert.equal(loader.compiledDir, viewsPath)
  })

  test('throw exception when views path has not been registered', (assert) => {
    const loader = new Loader()
    const output = () => loader.load('foo')
    assert.throw(output, 'E_MISSING_VIEW: Cannot render foo.edge. Make sure to register the views path')
  })

  test('throw exception if unable to load view', (assert) => {
    const viewsPath = path.join(__dirname, './')
    const loader = new Loader(viewsPath)
    const output = () => loader.load('foo')
    assert.throw(output, `E_MISSING_VIEW: Cannot render foo.edge. Make sure the file exists at ${viewsPath} location`)
  })

  test('load and return the view', (assert) => {
    const viewsPath = path.join(__dirname, '../../test-helpers/views')
    const loader = new Loader(viewsPath)
    const output = loader.load('welcome')
    assert.equal(output.trim(), '{{ username }}')
  })

  test('make absolute path to view', (assert) => {
    const viewsPath = path.join(__dirname, '../../test-helpers/views')
    const loader = new Loader(viewsPath)
    const output = loader.getViewPath(loader._normalizeViewName('welcome'))
    assert.equal(output, path.join(viewsPath, 'welcome.edge'))
  })

  test('make absolute path to view when name has .edge extension', (assert) => {
    const viewsPath = path.join(__dirname, '../test-helpers/views')
    const loader = new Loader(viewsPath)
    const output = loader.getViewPath(loader._normalizeViewName('welcome.edge'))
    assert.equal(output, path.join(viewsPath, 'welcome.edge'))
  })

  test('make absolute path to view when name is seperated with (.)', (assert) => {
    const viewsPath = path.join(__dirname, '../test-helpers/views')
    const loader = new Loader(viewsPath)
    const output = loader.getViewPath(loader._normalizeViewName('partials.users'))
    assert.equal(output, path.join(viewsPath, 'partials/users.edge'))
  })

  test('make absolute path to view when name is seperated with (.) and has edge extension', (assert) => {
    const viewsPath = path.join(__dirname, '../test-helpers/views')
    const loader = new Loader(viewsPath)
    const output = loader.getViewPath(loader._normalizeViewName('partials.users.edge'))
    assert.equal(output, path.join(viewsPath, 'partials/users.edge'))
  })

  test('load and return the presenter', (assert) => {
    const presentersPath = path.join(__dirname, '../../test-helpers/presenters')
    const loader = new Loader('', presentersPath)
    const UserPresenter = loader.loadPresenter('User')
    assert.equal(UserPresenter.name, 'UserPresenter')
  })

  test('throw exception when presenters path has not been registered', (assert) => {
    const loader = new Loader()
    const output = () => loader.loadPresenter('User')
    assert.throw(output, 'E_MISSING_PRESENTER: Cannot load User Presenter. Make sure to register the presenters path')
  })

  test('throw exception when unable to load the presenter', (assert) => {
    const presentersPath = path.join(__dirname, '../../test-helpers/presenters')
    const loader = new Loader('', presentersPath)
    const output = () => loader.loadPresenter('Foo')
    assert.throw(output, `E_MISSING_PRESENTER: Cannot load Foo Presenter. Make sure the file exists at ${presentersPath} location`)
  })

  test('load a pre-compiled template', (assert) => {
    const compiledDir = path.join(__dirname, '../../test-helpers/views/compiled')
    const loader = new Loader()
    loader.compiledDir = compiledDir
    const template = loader.loadPreCompiled('loopUsers')
    assert.isFunction(template)
  })

  test('return null when unable to load a pre-compiled template', (assert) => {
    const compiledDir = path.join(__dirname, '../../test-helpers/views/compiled')
    const loader = new Loader()
    loader.compiledDir = compiledDir
    const template = loader.loadPreCompiled('foo')
    assert.isNull(template)
  })

  test('return null when compiled dir is not registered', (assert) => {
    const loader = new Loader()
    const template = loader.loadPreCompiled('foo')
    assert.isNull(template)
  })
})
