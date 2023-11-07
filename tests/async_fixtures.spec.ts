/*
 * edge.js-parser
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import './assert_extend.js'

import dedent from 'dedent-js'
import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readdirSync, readFileSync, statSync } from 'node:fs'

import * as tags from '../src/tags/main.js'
import { Loader } from '../src/loader.js'
import { Template } from '../src/template.js'
import { Compiler } from '../src/compiler.js'
import { Processor } from '../src/processor.js'
import * as compatTags from '../src/migrate/tags/main.js'

import { normalizeNewLines, normalizeFilename } from '../tests_helpers/index.js'

const basePath = join(dirname(fileURLToPath(import.meta.url)), '../async_fixtures')

const loader = new Loader()
loader.mount('default', basePath)

const processor = new Processor()
test.group('Async Fixtures', (group) => {
  group.setup(() => {
    Object.keys(tags).forEach((tag) => {
      tags[tag as keyof typeof tags].boot?.(Template)
    })
    Object.keys(compatTags).forEach((tag) => {
      compatTags[tag as keyof typeof compatTags].boot?.(Template)
    })
  })

  const dirs = readdirSync(basePath).filter((file) => statSync(join(basePath, file)).isDirectory())
  const compiler = new Compiler(
    loader,
    {
      ...tags,
      ...compatTags,
    },
    processor,
    { async: true }
  )

  dirs.forEach((dir) => {
    const dirBasePath = join(basePath, dir)
    const compatMode = dir.endsWith('-compat')

    test(dir, async ({ assert }) => {
      const template = new Template(compiler, {}, {}, processor)
      compiler.compat = compatMode

      /**
       * Compiled output
       */
      const compiledTemplate = compiler.compile(`${dir}/index.edge`)
      const expectedCompiled = normalizeNewLines(
        readFileSync(join(dirBasePath, 'compiled.js'), 'utf-8')
      )

      assert.stringEqual(
        compiledTemplate.toString(),
        dedent`async function anonymous(template,state,$context
          ) {
          ${expectedCompiled
            .split('\n')
            .map((line) => normalizeFilename(dirBasePath, line))
            .join('\n')}
          }`
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
    }).tags(compatMode ? ['compat'] : [])
  })
})

test.group('Async Fixtures | Cached', (group) => {
  group.setup(() => {
    Object.keys(tags).forEach((tag) => {
      tags[tag as keyof typeof tags].boot?.(Template)
    })
    Object.keys(compatTags).forEach((tag) => {
      compatTags[tag as keyof typeof compatTags].boot?.(Template)
    })
  })

  const dirs = readdirSync(basePath).filter((file) => statSync(join(basePath, file)).isDirectory())
  const compiler = new Compiler(
    loader,
    {
      ...tags,
      ...compatTags,
    },
    processor,
    { async: true, cache: true }
  )

  dirs.forEach((dir) => {
    const dirBasePath = join(basePath, dir)
    const compatMode = dir.endsWith('-compat')

    test(dir, async ({ assert }) => {
      const template = new Template(compiler, {}, {}, processor)
      compiler.compat = compatMode

      /**
       * Compiled output
       */
      const compiledTemplate = compiler.compile(`${dir}/index.edge`)
      const expectedCompiled = normalizeNewLines(
        readFileSync(join(dirBasePath, 'compiled.js'), 'utf-8')
      )

      assert.stringEqual(
        compiledTemplate.toString(),
        dedent`async function anonymous(template,state,$context
          ) {
          ${expectedCompiled
            .split('\n')
            .map((line) => normalizeFilename(dirBasePath, line))
            .join('\n')}
          }`
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
    }).tags(compatMode ? ['compat'] : [])
  })
})
