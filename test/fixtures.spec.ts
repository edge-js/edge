/*
* edge-parser
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { Context } from '../src/Context'
import { Template } from '../src/Template'
import { Compiler } from '../src/Compiler'
import { Loader } from '../src/Loader'
import * as tags from '../src/Tags'

const basePath = join(__dirname, '../fixtures')
const loader = new Loader()
loader.mount('default', basePath)
const compiler = new Compiler(loader, tags)

test.grep('layout-tag')

test.group('Fixtures', (group) => {
  group.before(() => {
    Object.keys(tags).forEach((tag) => {
      if (tags[tag].run) {
        tags[tag].run(Context)
      }
    })
  })

  const dirs = readdirSync(basePath).filter((file) => {
    return statSync(join(basePath, file)).isDirectory()
  })

  dirs.forEach((dir) => {
    const dirBasePath = join(basePath, dir)

    test(dir, (assert) => {
      const template = new Template(compiler, {}, {})

      const { template: compiled } = compiler.compile(`${dir}/index.edge`, false)
      const expectedCompiled = readFileSync(join(dirBasePath, 'compiled.js'), 'utf-8')
      assert.stringEqual(compiled, expectedCompiled)

      const out = readFileSync(join(dirBasePath, 'index.txt'), 'utf-8')
      const output = template.render(`${dir}/index.edge`, JSON.parse(readFileSync(join(dirBasePath, 'index.json'), 'utf-8')))
      assert.equal(output.trim(), out)
    })
  })
})
