/*
 * edge-parser
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import './assert_extend.js'

import { test } from '@japa/runner'
import { dirname, join } from 'node:path'
import { readdirSync, readFileSync, statSync } from 'node:fs'

import * as tags from '../src/tags/index.js'
import { Loader } from '../src/loader/index.js'
import { Template } from '../src/template/index.js'
import { Compiler } from '../src/compiler/index.js'
import { Processor } from '../src/processor/index.js'

import { normalizeNewLines, normalizeFilename } from '../test_helpers/index.js'
import { fileURLToPath } from 'node:url'

const basePath = join(dirname(fileURLToPath(import.meta.url)), '../async_fixtures')

const loader = new Loader()
loader.mount('default', basePath)

const processor = new Processor()
test.group('Async Fixtures', (group) => {
  group.setup(() => {
    Object.keys(tags).forEach((tag) => {
      // @ts-ignore
      if (tags[tag].boot) {
        // @ts-ignore
        tags[tag].boot(Template)
      }
    })
  })

  const dirs = readdirSync(basePath).filter((file) => statSync(join(basePath, file)).isDirectory())
  const compiler = new Compiler(loader, tags, processor, { async: true })

  dirs.forEach((dir) => {
    const dirBasePath = join(basePath, dir)
    test(dir, async ({ assert }) => {
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
  group.setup(() => {
    Object.keys(tags).forEach((tag) => {
      // @ts-ignore
      if (tags[tag].boot) {
        // @ts-ignore
        tags[tag].boot(Template)
      }
    })
  })

  const dirs = readdirSync(basePath).filter((file) => statSync(join(basePath, file)).isDirectory())
  const compiler = new Compiler(loader, tags, processor, { async: true, cache: true })

  dirs.forEach((dir) => {
    const dirBasePath = join(basePath, dir)
    test(dir, async ({ assert }) => {
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