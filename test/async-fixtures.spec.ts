/*
 * edge-parser
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import './assert-extend'

import test from 'japa'
import { join } from 'path'
import { readdirSync, readFileSync, statSync } from 'fs'

import * as tags from '../src/Tags'
import { Loader } from '../src/Loader'
import { Template } from '../src/Template'
import { Compiler } from '../src/Compiler'
import { Processor } from '../src/Processor'

import { normalizeNewLines, normalizeFilename } from '../test-helpers'

const basePath = join(__dirname, '../async-fixtures')

const loader = new Loader()
loader.mount('default', basePath)

const processor = new Processor()
test.group('Async Fixtures', (group) => {
  group.before(() => {
    Object.keys(tags).forEach((tag) => {
      if (tags[tag].boot) {
        tags[tag].boot(Template)
      }
    })
  })

  const dirs = readdirSync(basePath).filter((file) => statSync(join(basePath, file)).isDirectory())
  const compiler = new Compiler(loader, tags, processor, { async: true })

  dirs.forEach((dir) => {
    const dirBasePath = join(basePath, dir)
    test(dir, async (assert) => {
      const template = new Template(compiler, {}, {}, processor)

      /**
       * Compiled output
       */
      const { template: compiled } = compiler.compile(`${dir}/index.edge`)
      const expectedCompiled = normalizeNewLines(
        readFileSync(join(dirBasePath, 'compiled.js'), 'utf-8')
      )

      assert.stringEqual(
        compiled,
        expectedCompiled
          .split('\n')
          .map((line) => normalizeFilename(dirBasePath, line))
          .join('\n')
      )

      /**
       * Render output
       */
      const out = readFileSync(join(dirBasePath, 'index.txt'), 'utf-8')
      const state = JSON.parse(readFileSync(join(dirBasePath, 'index.json'), 'utf-8'))
      const output = await template.render(`${dir}/index.edge`, state)
      const outputRaw = await template.renderRaw(
        readFileSync(join(dirBasePath, 'index.edge'), 'utf-8'),
        state
      )
      assert.stringEqual(output.trim(), out)
      assert.stringEqual(outputRaw.trim(), out)
    })
  })
})

test.group('Async Fixtures | Cached', (group) => {
  group.before(() => {
    Object.keys(tags).forEach((tag) => {
      if (tags[tag].boot) {
        tags[tag].boot(Template)
      }
    })
  })

  const dirs = readdirSync(basePath).filter((file) => statSync(join(basePath, file)).isDirectory())
  const compiler = new Compiler(loader, tags, processor, { async: true, cache: true })

  dirs.forEach((dir) => {
    const dirBasePath = join(basePath, dir)
    test(dir, async (assert) => {
      const template = new Template(compiler, {}, {}, processor)

      /**
       * Compiled output
       */
      const { template: compiled } = compiler.compile(`${dir}/index.edge`)
      const expectedCompiled = normalizeNewLines(
        readFileSync(join(dirBasePath, 'compiled.js'), 'utf-8')
      )

      assert.stringEqual(
        compiled,
        expectedCompiled
          .split('\n')
          .map((line) => normalizeFilename(dirBasePath, line))
          .join('\n')
      )

      /**
       * Render output
       */
      const out = readFileSync(join(dirBasePath, 'index.txt'), 'utf-8')
      const state = JSON.parse(readFileSync(join(dirBasePath, 'index.json'), 'utf-8'))
      const output = await template.render(`${dir}/index.edge`, state)
      const outputRaw = await template.renderRaw(
        readFileSync(join(dirBasePath, 'index.edge'), 'utf-8'),
        state
      )
      assert.stringEqual(output.trim(), out)
      assert.stringEqual(outputRaw.trim(), out)
    })
  })
})
