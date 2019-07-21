/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { join } from 'path'
import * as test from 'japa'
import { Filesystem } from '@poppinss/dev-utils'

import { Loader } from '../src/Loader'

const fs = new Filesystem(join(__dirname, 'views'))

test.group('Loader', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('mount path with a name', (assert) => {
    const loader = new Loader()
    loader.mount('default', fs.basePath)
    assert.deepEqual(loader.mounted, { default: fs.basePath })
  })

  test('unmount path with a name', (assert) => {
    const loader = new Loader()
    loader.mount('default', fs.basePath)
    loader.unmount('default')

    assert.deepEqual(loader.mounted, {})
  })

  test('throw exception when resolving path from undefined location', (assert) => {
    const loader = new Loader()
    const fn = () => loader.resolve('foo', true)
    assert.throw(fn, 'E_UNMOUNTED_DISK_NAME: {default} namespace is not mounted')
  })

  test('resolve template for default location', async (assert) => {
    await fs.add('foo.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const { template } = loader.resolve('foo', false)
    assert.equal(template.trim(), 'Hello world')
  })

  test('raise error when template is missing', async (assert) => {
    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const fn = () => loader.resolve('foo', false)
    assert.throw(fn, `Cannot resolve ${join(fs.basePath, 'foo.edge')}. Make sure the file exists`)
  })

  test('resolve template with extension', async (assert) => {
    await fs.add('foo.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const { template } = loader.resolve('foo.edge', false)
    assert.equal(template.trim(), 'Hello world')
  })

  test('resolve template from a named mount path', async (assert) => {
    await fs.add('foo.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('users', fs.basePath)

    const { template } = loader.resolve('users::foo.edge', false)
    assert.equal(template.trim(), 'Hello world')
  })

  test('do not replace edge within the template path name', async (assert) => {
    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const templatePath = loader.makePath('edge-partial.edge')
    assert.equal(templatePath, join(fs.basePath, 'edge-partial.edge'))
  })

  test('do not replace edge within the template path seperator', async (assert) => {
    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const templatePath = loader.makePath('partial/edge')
    assert.equal(templatePath, join(fs.basePath, 'partial/edge.edge'))
  })

  test('do not replace edge within the template path seperator with extension', async (assert) => {
    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const templatePath = loader.makePath('partial/edge.edge')
    assert.equal(templatePath, join(fs.basePath, 'partial/edge.edge'))
  })

  test('do not replace edge within the template path seperator with named disk', async (assert) => {
    const loader = new Loader()
    loader.mount('users', fs.basePath)

    const templatePath = loader.makePath('users::partial/edge.edge')
    assert.equal(templatePath, join(fs.basePath, 'partial/edge.edge'))
  })

  test('resolve presenter if exists', async (assert) => {
    await fs.add('foo.edge', 'Hello world')
    await fs.add('foo.presenter.js', `module.exports = class Foo {
    }`)

    const loader = new Loader()
    loader.mount('users', fs.basePath)

    const { template, Presenter } = loader.resolve('users::foo.edge', true)
    assert.equal(template.trim(), 'Hello world')
    assert.equal(Presenter!['name'], 'Foo')
  })

  test('do not resolve presenter if withPresenter is set to false', async (assert) => {
    await fs.add('foo.edge', 'Hello world')
    await fs.add('foo.presenter.js', `module.exports = class Foo {
    }`)

    const loader = new Loader()
    loader.mount('users', fs.basePath)

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

    assert.throw(fn, 'Cannot override previously registered {my-view} template')
  })
})
