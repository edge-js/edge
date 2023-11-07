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
})

test.group('Loader | listComponents', () => {
  test('get components for the default disk', async ({ assert, fs }) => {
    await fs.create('components/foo.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const componentsList = loader.listComponents()
    assert.deepEqual(componentsList, [
      {
        diskName: 'default',
        components: [
          {
            componentName: 'components/foo',
            tagName: 'foo',
          },
        ],
      },
    ])
  })

  test('get components from nested directories', async ({ assert, fs }) => {
    await fs.create('components/modal/root.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const componentsList = loader.listComponents()
    assert.deepEqual(componentsList, [
      {
        diskName: 'default',
        components: [
          {
            componentName: 'components/modal/root',
            tagName: 'modal.root',
          },
        ],
      },
    ])
  })

  test('get components from nested directories from a named disk', async ({ assert, fs }) => {
    await fs.create('components/modal/root.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('uikit', fs.basePath)

    const componentsList = loader.listComponents()
    assert.deepEqual(componentsList, [
      {
        diskName: 'uikit',
        components: [
          {
            componentName: 'uikit::components/modal/root',
            tagName: 'uikit.modal.root',
          },
        ],
      },
    ])
  })

  test('rename nested components saved in index.edge file', async ({ assert, fs }) => {
    await fs.create('components/modal/index.edge', 'Hello world')
    await fs.create('components/index.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('uikit', fs.basePath)

    const componentsList = loader.listComponents()
    assert.deepEqual(componentsList, [
      {
        diskName: 'uikit',
        components: [
          {
            componentName: 'uikit::components/index',
            tagName: 'uikit.index',
          },
          {
            componentName: 'uikit::components/modal/index',
            tagName: 'uikit.modal',
          },
        ],
      },
    ])
  })

  test('rename nested components saved in index.edge file from default disk', async ({
    assert,
    fs,
  }) => {
    await fs.create('components/modal/index.edge', 'Hello world')
    await fs.create('components/index.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const componentsList = loader.listComponents()
    assert.deepEqual(componentsList, [
      {
        diskName: 'default',
        components: [
          {
            componentName: 'components/index',
            tagName: 'index',
          },
          {
            componentName: 'components/modal/index',
            tagName: 'modal',
          },
        ],
      },
    ])
  })

  test('get in-memory templates as components', async ({ assert, fs }) => {
    await fs.create('components/foo.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('default', fs.basePath)
    loader.register('uikit/button', {
      template: ``,
    })

    const componentsList = loader.listComponents()
    assert.deepEqual(componentsList, [
      {
        diskName: 'default',
        components: [
          {
            componentName: 'uikit/button',
            tagName: 'uikit.button',
          },
          {
            componentName: 'components/foo',
            tagName: 'foo',
          },
        ],
      },
    ])
  })
})

test.group('Loader | listComponents', () => {
  test('get templates for the default disk', async ({ assert, fs }) => {
    await fs.create('components/foo.edge', 'Hello world')
    await fs.create('header.edge', 'Hello world')
    await fs.create('footer.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const componentsList = loader.listTemplates()
    assert.deepEqual(componentsList, [
      {
        diskName: 'default',
        templates: ['components/foo', 'footer', 'header'],
      },
    ])
  })

  test('get templates for the named disk', async ({ assert, fs }) => {
    await fs.create('components/foo.edge', 'Hello world')
    await fs.create('header.edge', 'Hello world')
    await fs.create('footer.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('elegant', fs.basePath)

    const componentsList = loader.listTemplates()
    assert.deepEqual(componentsList, [
      {
        diskName: 'elegant',
        templates: ['elegant::components/foo', 'elegant::footer', 'elegant::header'],
      },
    ])
  })

  test('get in-memory templates', async ({ assert, fs }) => {
    await fs.create('components/foo.edge', 'Hello world')
    await fs.create('header.edge', 'Hello world')
    await fs.create('footer.edge', 'Hello world')

    const loader = new Loader()
    loader.mount('elegant', fs.basePath)
    loader.mount('default', join(fs.basePath, 'foo'))
    loader.register('uibutton', {
      template: '',
    })

    const componentsList = loader.listTemplates()
    assert.deepEqual(componentsList, [
      {
        diskName: 'elegant',
        templates: ['elegant::components/foo', 'elegant::footer', 'elegant::header'],
      },
      {
        diskName: 'default',
        templates: ['uibutton'],
      },
    ])
  })
})
