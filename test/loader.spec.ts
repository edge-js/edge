/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { join } from 'path'
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
    const fn = () => loader.resolve('foo')
    assert.throw(fn, '"default" namespace is not mounted')
  })

  test('resolve template for the default disk', async (assert) => {
    await fs.add('foo.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const { template } = loader.resolve('foo')
    assert.equal(template.trim(), 'Hello world')
  })

  test('raise error when template is missing', async (assert) => {
    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const fn = () => loader.resolve('foo')
    assert.throw(fn, `Cannot resolve "${join(fs.basePath, 'foo.edge')}". Make sure the file exists`)
  })

  test('resolve template with extension', async (assert) => {
    await fs.add('foo.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const { template } = loader.resolve('foo.edge')
    assert.equal(template.trim(), 'Hello world')
  })

  test('resolve template from a named disk', async (assert) => {
    await fs.add('foo.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('users', fs.basePath)

    const { template } = loader.resolve('users::foo.edge')
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

  test('pre register templates with a key', async (assert) => {
    const loader = new Loader()
    loader.register('my-view', {
      template: 'Hello world',
    })

    const { template } = loader.resolve('my-view')
    assert.equal(template.trim(), 'Hello world')
  })

  test('remove registered template', async (assert) => {
    const loader = new Loader()
    loader.register('my-view', {
      template: 'Hello world',
    })
    loader.mount('default', __dirname)

    const { template } = loader.resolve('my-view')
    assert.equal(template.trim(), 'Hello world')

    loader.remove('my-view')
    assert.throw(
      () => loader.resolve('my-view'),
      `Cannot resolve "${join(__dirname, 'my-view.edge')}". Make sure the file exists`
    )
  })

  test('pre registering duplicate templates must raise an error', async (assert) => {
    const loader = new Loader()
    loader.register('my-view', { template: 'Hello world' })
    const fn = () => loader.register('my-view', { template: 'Hello world' })

    assert.throw(fn, 'Cannot override previously registered "my-view" template')
  })

  test('resolve template with dot seperator', async (assert) => {
    await fs.add('foo/bar.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const { template } = loader.resolve('foo.bar')
    assert.equal(template.trim(), 'Hello world')
  })
})
