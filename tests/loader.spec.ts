/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { test } from '@japa/runner'
import { getDirname } from '@poppinss/utils'

import { Loader } from '../src/loader.js'

const dirnameEsm = getDirname(import.meta.url)

test.group('Loader', () => {
  test('mount path with a name', ({ assert, fs }) => {
    const loader = new Loader()
    loader.mount('default', fs.basePath)
    assert.deepEqual(loader.mounted, { default: fs.basePath })
  })

  test('unmount path with a name', ({ assert, fs }) => {
    const loader = new Loader()
    loader.mount('default', fs.basePath)
    loader.unmount('default')
    assert.deepEqual(loader.mounted, {})
  })

  test('throw exception when resolving path from undefined location', ({ assert }) => {
    const loader = new Loader()
    const fn = () => loader.resolve('foo')
    assert.throws(fn, '"default" namespace is not mounted')
  })

  test('resolve template for the default disk', async ({ assert, fs }) => {
    await fs.create('foo.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const { template } = loader.resolve('foo')
    assert.equal(template.trim(), 'Hello world')
  })

  test('raise error when template is missing', async ({ assert, fs }) => {
    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const fn = () => loader.resolve('foo')
    assert.throws(
      fn,
      `Cannot resolve "${join(fs.basePath, 'foo.edge')}". Make sure the file exists`
    )
  })

  test('resolve template with extension', async ({ assert, fs }) => {
    await fs.create('foo.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const { template } = loader.resolve('foo.edge')
    assert.equal(template.trim(), 'Hello world')
  })

  test('resolve template from a named disk', async ({ assert, fs }) => {
    await fs.create('foo.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('users', fs.basePath)

    const { template } = loader.resolve('users::foo.edge')
    assert.equal(template.trim(), 'Hello world')
  })

  test('do not replace edge within the template path name', async ({ assert, fs }) => {
    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const templatePath = loader.makePath('edge-partial.edge')
    assert.equal(templatePath, join(fs.basePath, 'edge-partial.edge'))
  })

  test('do not replace edge within the template path seperator', async ({ assert, fs }) => {
    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const templatePath = loader.makePath('partial/edge')
    assert.equal(templatePath, join(fs.basePath, 'partial/edge.edge'))
  })

  test('do not replace edge within the template path seperator with extension', async ({
    assert,
    fs,
  }) => {
    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const templatePath = loader.makePath('partial/edge.edge')
    assert.equal(templatePath, join(fs.basePath, 'partial/edge.edge'))
  })

  test('do not replace edge within the template path seperator with named disk', async ({
    assert,
    fs,
  }) => {
    const loader = new Loader()
    loader.mount('users', fs.basePath)

    const templatePath = loader.makePath('users::partial/edge.edge')
    assert.equal(templatePath, join(fs.basePath, 'partial/edge.edge'))
  })

  test('pre register templates with a key', async ({ assert }) => {
    const loader = new Loader()
    loader.register('my-view', {
      template: 'Hello world',
    })

    const { template } = loader.resolve('my-view')
    assert.equal(template.trim(), 'Hello world')
  })

  test('remove registered template', async ({ assert }) => {
    const loader = new Loader()
    loader.register('my-view', {
      template: 'Hello world',
    })
    loader.mount('default', dirnameEsm)

    const { template } = loader.resolve('my-view')
    assert.equal(template.trim(), 'Hello world')

    loader.remove('my-view')
    assert.throws(
      () => loader.resolve('my-view'),
      `Cannot resolve "${join(dirnameEsm, 'my-view.edge')}". Make sure the file exists`
    )
  })

  test('pre registering duplicate templates must raise an error', async ({ assert }) => {
    const loader = new Loader()
    loader.register('my-view', { template: 'Hello world' })
    const fn = () => loader.register('my-view', { template: 'Hello world' })

    assert.throws(fn, 'Cannot override previously registered "my-view" template')
  })

  test('resolve template with dot seperator', async ({ assert, fs }) => {
    await fs.create('foo/bar.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const { template } = loader.resolve('foo.bar')
    assert.equal(template.trim(), 'Hello world')
  })
})
