/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import * as fs from 'fs-extra'

import { join } from 'path'
import { Loader } from '../src/Loader'

const viewsDir = join(__dirname, 'views')

test.group('Loader', (group) => {
  group.afterEach(async () => {
    await fs.remove(viewsDir)
  })

  test('mount path with a name', (assert) => {
    const loader = new Loader()
    loader.mount('default', viewsDir)
    assert.deepEqual(loader.mounted, { default: join(__dirname, 'views') })
  })

  test('unmount path with a name', (assert) => {
    const loader = new Loader()
    loader.mount('default', viewsDir)
    loader.unmount('default')

    assert.deepEqual(loader.mounted, {})
  })

  test('throw exception when resolving path from undefined location', (assert) => {
    const loader = new Loader()
    const fn = () => loader.resolve('foo', true)
    assert.throw(fn, 'Attempting to resolve foo.edge template for unmounted default location')
  })

  test('resolve template for default location', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello world')

    const loader = new Loader()
    loader.mount('default', viewsDir)

    const { template } = loader.resolve('foo', false)
    assert.equal(template.trim(), 'Hello world')
  })

  test('raise error when template is missing', async (assert) => {
    const loader = new Loader()
    loader.mount('default', viewsDir)

    const fn = () => loader.resolve('foo', false)
    assert.throw(fn, `Cannot resolve ${join(viewsDir, 'foo.edge')}. Make sure file exists.`)
  })

  test('resolve template with extension', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello world')

    const loader = new Loader()
    loader.mount('default', viewsDir)

    const { template } = loader.resolve('foo.edge', false)
    assert.equal(template.trim(), 'Hello world')
  })

  test('resolve template from a named mount path', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello world')

    const loader = new Loader()
    loader.mount('users', viewsDir)

    const { template } = loader.resolve('users::foo.edge', false)
    assert.equal(template.trim(), 'Hello world')
  })

  test('do not replace edge within the template path name', async (assert) => {
    const loader = new Loader()
    loader.mount('default', viewsDir)

    const templatePath = loader.makePath('edge-partial.edge')
    assert.equal(templatePath, join(viewsDir, 'edge-partial.edge'))
  })

  test('do not replace edge within the template path seperator', async (assert) => {
    const loader = new Loader()
    loader.mount('default', viewsDir)

    const templatePath = loader.makePath('partial/edge')
    assert.equal(templatePath, join(viewsDir, 'partial/edge.edge'))
  })

  test('do not replace edge within the template path seperator with extension', async (assert) => {
    const loader = new Loader()
    loader.mount('default', viewsDir)

    const templatePath = loader.makePath('partial/edge.edge')
    assert.equal(templatePath, join(viewsDir, 'partial/edge.edge'))
  })

  test('do not replace edge within the template path seperator with named disk', async (assert) => {
    const loader = new Loader()
    loader.mount('users', viewsDir)

    const templatePath = loader.makePath('users::partial/edge.edge')
    assert.equal(templatePath, join(viewsDir, 'partial/edge.edge'))
  })

  test('resolve presenter if exists', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello world')
    await fs.outputFile(join(viewsDir, 'foo.presenter.js'), `module.exports = class Foo {
    }`)

    const loader = new Loader()
    loader.mount('users', viewsDir)

    const { template, Presenter } = loader.resolve('users::foo.edge', true)
    assert.equal(template.trim(), 'Hello world')
    assert.equal(Presenter!['name'], 'Foo')
  })

  test('do not resolve presenter if withPresenter is set to false', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello world')
    await fs.outputFile(join(viewsDir, 'foo.presenter.js'), `module.exports = class Foo {
    }`)

    const loader = new Loader()
    loader.mount('users', viewsDir)

    const { template, Presenter } = loader.resolve('users::foo.edge', false)
    assert.equal(template.trim(), 'Hello world')
    assert.isUndefined(Presenter)
  })

  test('pre register templates with a key', async (assert) => {
    const loader = new Loader()
    loader.register('my-view', {
      template: 'Hello world',
    })

    const { template, Presenter } = loader.resolve('my-view', true)
    assert.equal(template.trim(), 'Hello world')
    assert.isUndefined(Presenter)
  })

  test('pre registering duplicate templates must raise an error', async (assert) => {
    const loader = new Loader()
    loader.register('my-view', { template: 'Hello world' })
    const fn = () => loader.register('my-view', { template: 'Hello world' })

    assert.throw(fn, 'Cannot override previously registered my-view template')
  })
})
