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

  test('throw exception when resolve path from undefined location', (assert) => {
    const loader = new Loader()
    const fn = () => loader.resolve('foo')
    assert.throw(fn, 'Attempting to resolve foo template for unmounted default location')
  })

  test('resolve template for given location', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello world')

    const loader = new Loader()
    loader.mount('default', viewsDir)

    const template = loader.resolve('foo')
    assert.equal(template.trim(), 'Hello world')
  })

  test('raise error when template is missing', async (assert) => {
    const loader = new Loader()
    loader.mount('default', viewsDir)

    const fn = () => loader.resolve('foo')
    assert.throw(fn, `Cannot resolve foo.edge. Make sure file exists at ${viewsDir} location.`)
  })

  test('resolve template with extension', async (assert) => {
    await fs.outputFile(join(viewsDir, 'foo.edge'), 'Hello world')

    const loader = new Loader()
    loader.mount('default', viewsDir)

    const template = loader.resolve('foo.edge')
    assert.equal(template.trim(), 'Hello world')
  })
})
