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
import { Context } from '../src/Context'
import { Template } from '../src/Template'
import { Compiler } from '../src/Compiler'

import { normalizeNewLines, normalizeFilename } from '../test-helpers'

const basePath = join(__dirname, '../newline-fixtures')

const loader = new Loader()
loader.mount('default', basePath)
const compiler = new Compiler(loader, tags)

test.group('Newline Fixtures', (group) => {
  group.before(() => {
    Object.keys(tags).forEach((tag) => {
      if (tags[tag].run) {
        tags[tag].run(Context)
      }
    })
  })

  const dirs = readdirSync(basePath).filter((file) => statSync(join(basePath, file)).isDirectory())

  dirs.forEach((dir) => {
    const dirBasePath = join(basePath, dir)
    test(dir, (assert) => {
      const template = new Template(compiler, {}, {})

      /**
       * Render output
       */
      const out = normalizeNewLines(readFileSync(join(dirBasePath, 'index.txt'), 'utf-8'))
      const state = JSON.parse(readFileSync(join(dirBasePath, 'index.json'), 'utf-8'))
      const output = template.render(`${dir}/index.edge`, state)

      assert.stringEqual(
        output,
        out.split('\n').map((line) => normalizeFilename(dirBasePath, line)).join('\n'),
      )
    })
  })
})
