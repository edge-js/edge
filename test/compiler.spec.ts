/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { dirname, join } from 'node:path'
import dedent from 'dedent-js'
// @ts-ignore untyped module
import stringify from 'js-stringify'
import { Filesystem } from '@poppinss/dev-utils'
import { TagTypes, MustacheTypes } from 'edge-lexer/types'

import { Loader } from '../src/loader/index.js'
import { setTag } from '../src/tags/set.js'
import { Template } from '../src/template/index.js'
import { Compiler } from '../src/compiler/index.js'
import { Processor } from '../src/processor/index.js'
import { layoutTag } from '../src/tags/layout.js'
import { sectionTag } from '../src/tags/section.js'
import { componentTag } from '../src/tags/component.js'
import { normalizeNewLines } from '../test_helpers/index.js'

import './assert_extend.js'
import { fileURLToPath } from 'node:url'

const fs = new Filesystem(join(dirname(fileURLToPath(import.meta.url)), 'views'))

test.group('Compiler | Cache', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('compile template', async ({ assert }) => {
    await fs.add('foo.edge', 'Hello {{ username }}')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, {}, new Processor())
    const { template } = compiler.compile('foo')

    assert.stringEqual(
      template,
      normalizeNewLines(dedent`let out = "";
      let $lineNumber = 1;
      let $filename = ${stringify(join(fs.basePath, 'foo.edge'))};
      try {
      out += "Hello ";
      out += \`\${template.escape(state.username)}\`;
      } catch (error) {
      template.reThrow(error, $filename, $lineNumber);
      }
      return out;`)
    )
  })

  test('save template to cache when caching is turned on', async ({ assert }) => {
    await fs.add('foo.edge', 'Hello {{ username }}')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, {}, new Processor(), { cache: true })
    assert.equal(
      compiler.compile('foo').template,
      compiler.cacheManager.get(join(fs.basePath, 'foo.edge'))!.template
    )
  })

  test('do not cache template when caching is turned off', async ({ assert }) => {
    await fs.add('foo.edge', 'Hello {{ username }}')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, {}, new Processor(), { cache: false })
    compiler.compile('foo')
    assert.isUndefined(compiler.cacheManager.get(join(fs.basePath, 'foo.edge')))
  })
})

test.group('Compiler | Tokenize', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('during tokenize, merge @section tags of a given layout', async ({ assert }) => {
    await fs.add(
      'master.edge',
      dedent`
      Master page
      @!section('content')
    `
    )

    await fs.add(
      'index.edge',
      dedent`
      @layout('master')
      @section('content')
        Hello world
      @endsection
    `
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const tags = {
      section: sectionTag,
      layout: layoutTag,
    }

    const compiler = new Compiler(loader, tags, new Processor())

    assert.deepEqual(compiler.tokenize('index.edge'), [
      {
        type: 'raw' as const,
        value: 'Master page',
        line: 1,
        filename: join(fs.basePath, 'master.edge'),
      },
      {
        type: TagTypes.TAG,
        filename: join(fs.basePath, 'index.edge'),
        properties: { name: 'section', jsArg: "'content'", selfclosed: false },
        loc: {
          start: { line: 2, col: 9 },
          end: { line: 2, col: 19 },
        },
        children: [
          {
            type: 'newline' as const,
            line: 2,
            filename: join(fs.basePath, 'index.edge'),
          },
          {
            type: 'raw' as const,
            value: '  Hello world',
            line: 3,
            filename: join(fs.basePath, 'index.edge'),
          },
        ],
      },
    ])
  })

  test('during tokenize, merge @set tags of a given layout', async ({ assert }) => {
    await fs.add(
      'master.edge',
      dedent`
      Master page
      @!section('content')
    `
    )

    await fs.add(
      'index.edge',
      dedent`
      @layout('master')
      @set('username', 'virk')
      @section('content')
        Hello world
      @endsection
    `
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const tags = {
      section: sectionTag,
      layout: layoutTag,
      set: setTag,
    }

    const compiler = new Compiler(loader, tags, new Processor())

    assert.deepEqual(compiler.tokenize('index.edge'), [
      {
        type: TagTypes.TAG,
        filename: join(fs.basePath, 'index.edge'),
        properties: { name: 'set', jsArg: "'username', 'virk'", selfclosed: false },
        loc: {
          start: { line: 2, col: 5 },
          end: { line: 2, col: 24 },
        },
        children: [],
      },
      {
        type: 'raw' as const,
        value: 'Master page',
        line: 1,
        filename: join(fs.basePath, 'master.edge'),
      },
      {
        type: TagTypes.TAG,
        filename: join(fs.basePath, 'index.edge'),
        properties: { name: 'section', jsArg: "'content'", selfclosed: false },
        loc: {
          start: { line: 3, col: 9 },
          end: { line: 3, col: 19 },
        },
        children: [
          {
            type: 'newline' as const,
            line: 3,
            filename: join(fs.basePath, 'index.edge'),
          },
          {
            type: 'raw' as const,
            value: '  Hello world',
            line: 4,
            filename: join(fs.basePath, 'index.edge'),
          },
        ],
      },
    ])
  })

  test('ensure template extending layout can only use section or set tags', async ({ assert }) => {
    assert.plan(4)

    await fs.add(
      'master.edge',
      dedent`
      Master page
      @!section('content')
    `
    )

    await fs.add(
      'index.edge',
      dedent`
      @layout('master')
      Hello world
    `
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)
    const tags = {
      section: sectionTag,
      layout: layoutTag,
    }

    const compiler = new Compiler(loader, tags, new Processor())

    try {
      compiler.tokenize('index.edge')
    } catch (error) {
      assert.equal(
        error.message,
        'Template extending a layout can only use "@section" or "@set" tags as top level nodes'
      )
      assert.equal(error.filename, join(fs.basePath, 'index.edge'))
      assert.equal(error.line, 2)
      assert.equal(error.col, 0)
    }
  })

  test('during tokenize, merge @section tags of a nested layouts', async ({ assert }) => {
    await fs.add(
      'super-master.edge',
      dedent`
      Master page
      @!section('header')
      @!section('content')
    `
    )

    await fs.add(
      'master.edge',
      dedent`
      @layout('super-master')
      @section('header')
        This is header
      @endsection
      @!section('content')
    `
    )

    await fs.add(
      'index.edge',
      dedent`
      @layout('master')
      @section('content')
        This is content
      @endsection
    `
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)
    const tags = {
      section: sectionTag,
      layout: layoutTag,
    }

    const compiler = new Compiler(loader, tags, new Processor())

    assert.deepEqual(compiler.tokenize('index.edge'), [
      {
        type: 'raw' as const,
        value: 'Master page',
        line: 1,
        filename: join(fs.basePath, 'super-master.edge'),
      },
      {
        type: TagTypes.TAG,
        filename: join(fs.basePath, 'master.edge'),
        properties: { name: 'section', jsArg: "'header'", selfclosed: false },
        loc: {
          start: { line: 2, col: 9 },
          end: { line: 2, col: 18 },
        },
        children: [
          {
            type: 'newline' as const,
            line: 2,
            filename: join(fs.basePath, 'master.edge'),
          },
          {
            type: 'raw' as const,
            value: '  This is header',
            line: 3,
            filename: join(fs.basePath, 'master.edge'),
          },
        ],
      },
      {
        type: 'newline',
        line: 2,
        filename: join(fs.basePath, 'super-master.edge'),
      },
      {
        type: TagTypes.TAG,
        filename: join(fs.basePath, 'index.edge'),
        properties: { name: 'section', jsArg: "'content'", selfclosed: false },
        loc: {
          start: { line: 2, col: 9 },
          end: { line: 2, col: 19 },
        },
        children: [
          {
            type: 'newline' as const,
            line: 2,
            filename: join(fs.basePath, 'index.edge'),
          },
          {
            type: 'raw' as const,
            value: '  This is content',
            line: 3,
            filename: join(fs.basePath, 'index.edge'),
          },
        ],
      },
    ])
  })

  test('layout tokens must point to its own filename', async ({ assert }) => {
    await fs.add(
      'master.edge',
      dedent`
      {{ username }}
      @!section('content')
    `
    )

    await fs.add(
      'index.edge',
      dedent`
      @layout('master')
      @section('content')
        Hello world
      @endsection
    `
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const tags = {
      section: sectionTag,
      layout: layoutTag,
    }

    const compiler = new Compiler(loader, tags, new Processor())

    assert.deepEqual(compiler.tokenize('index.edge'), [
      {
        type: MustacheTypes.MUSTACHE,
        filename: join(fs.basePath, 'master.edge'),
        loc: {
          start: { line: 1, col: 2 },
          end: { line: 1, col: 14 },
        },
        properties: { jsArg: ' username ' },
      },
      {
        type: TagTypes.TAG,
        filename: join(fs.basePath, 'index.edge'),
        properties: { name: 'section', jsArg: "'content'", selfclosed: false },
        loc: {
          start: { line: 2, col: 9 },
          end: { line: 2, col: 19 },
        },
        children: [
          {
            type: 'newline' as const,
            line: 2,
            filename: join(fs.basePath, 'index.edge'),
          },
          {
            type: 'raw' as const,
            value: '  Hello world',
            line: 3,
            filename: join(fs.basePath, 'index.edge'),
          },
        ],
      },
    ])
  })
})

test.group('Compiler | Compile', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('compile template with layouts', async ({ assert }) => {
    await fs.add(
      'master.edge',
      dedent`
      {{ username }}
      @!section('content')
    `
    )

    await fs.add(
      'index.edge',
      dedent`
      @layout('master')
      @section('content')
        {{ content }}
      @endsection
    `
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)
    const tags = {
      section: sectionTag,
      layout: layoutTag,
    }

    const compiler = new Compiler(loader, tags, new Processor())

    assert.stringEqual(
      compiler.compile('index.edge').template,
      normalizeNewLines(dedent`let out = "";
      let $lineNumber = 1;
      let $filename = ${stringify(join(fs.basePath, 'index.edge'))};
      try {
      $filename = ${stringify(join(fs.basePath, 'master.edge'))};
      out += \`\${template.escape(state.username)}\`;
      out += "\\n";
      out += "  ";
      $filename = ${stringify(join(fs.basePath, 'index.edge'))};
      $lineNumber = 3;
      out += \`\${template.escape(state.content)}\`;
      } catch (error) {
      template.reThrow(error, $filename, $lineNumber);
      }
      return out;
    `)
    )
  })

  test('compile errors inside layout must point to the right file', async ({ assert }) => {
    assert.plan(3)

    await fs.add(
      'master.edge',
      dedent`
      {{ user name }}
      @!section('content')
    `
    )

    await fs.add(
      'index.edge',
      dedent`
      @layout('master')
      @section('content')
        {{ content }}
      @endsection
    `
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      new Processor()
    )

    try {
      compiler.compile('index.edge')
    } catch (error) {
      assert.equal(error.filename, join(fs.basePath, 'master.edge'))
      assert.equal(error.line, 1)
      assert.equal(error.col, 8)
    }
  })

  test('compile errors parent template must point to the right file', async ({ assert }) => {
    assert.plan(3)

    await fs.add(
      'master.edge',
      dedent`
      {{ username }}
      @!section('content')
    `
    )

    await fs.add(
      'index.edge',
      dedent`
      @layout('master')
      @section('content')
        {{ con tent }}
      @endsection
    `
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      new Processor()
    )

    try {
      compiler.compile('index.edge')
    } catch (error) {
      assert.equal(error.filename, join(fs.basePath, 'index.edge'))
      assert.equal(error.line, 3)
      assert.equal(error.col, 9)
    }
  })

  test('runtime errors inside layout must point to the right file', async ({ assert }) => {
    assert.plan(4)

    await fs.add(
      'master.edge',
      dedent`
      {{ getUserName() }}
      @!section('content')
    `
    )

    await fs.add(
      'index.edge',
      dedent`
      @layout('master')
      @section('content')
        {{ content }}
      @endsection
    `
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      new Processor()
    )

    try {
      const fn = compiler.compile('index.edge').template
      new Function('template', 'state', fn)(new Template(compiler, {}, {}, new Processor()), {})
    } catch (error) {
      assert.equal(error.message, 'getUserName is not a function')
      assert.equal(error.filename, join(fs.basePath, 'master.edge'))
      assert.equal(error.line, 1)
      assert.equal(error.col, 0)
    }
  })

  test('runtime errors inside parent template must point to the right file', async ({ assert }) => {
    assert.plan(4)

    await fs.add(
      'master.edge',
      dedent`
    {{ username }}
    @!section('content')
    `
    )

    await fs.add(
      'index.edge',
      dedent`
    @layout('master')
    @section('content')
      {{ getContent() }}
    @endsection
    `
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      new Processor()
    )

    try {
      const fn = compiler.compile('index.edge').template
      new Function('template', 'state', fn)(new Template(compiler, {}, {}, new Processor()), {})
    } catch (error) {
      assert.equal(error.message, 'getContent is not a function')
      assert.equal(error.filename, join(fs.basePath, 'index.edge'))
      assert.equal(error.line, 3)
      assert.equal(error.col, 0)
    }
  })
})

test.group('Compiler | Compile Raw', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('compile template with layouts', async ({ assert }) => {
    await fs.add(
      'master.edge',
      dedent`
      {{ username }}
      @!section('content')
    `
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)
    const tags = {
      section: sectionTag,
      layout: layoutTag,
    }

    const compiler = new Compiler(loader, tags, new Processor())

    assert.stringEqual(
      compiler.compileRaw(dedent`
      @layout('master')
      @section('content')
        {{ content }}
      @endsection
    `).template,
      normalizeNewLines(dedent`let out = "";
      let $lineNumber = 1;
      let $filename = ${stringify('eval.edge')};
      try {
      $filename = ${stringify(join(fs.basePath, 'master.edge'))};
      out += \`\${template.escape(state.username)}\`;
      out += "\\n";
      out += "  ";
      $filename = ${stringify('eval.edge')};
      $lineNumber = 3;
      out += \`\${template.escape(state.content)}\`;
      } catch (error) {
      template.reThrow(error, $filename, $lineNumber);
      }
      return out;
    `)
    )
  })

  test('compile errors inside layout must point to the right file', async ({ assert }) => {
    assert.plan(3)

    await fs.add(
      'master.edge',
      dedent`
      {{ user name }}
      @!section('content')
    `
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      new Processor()
    )

    try {
      compiler.compileRaw(dedent`
      @layout('master')
      @section('content')
        {{ content }}
      @endsection
    `)
    } catch (error) {
      assert.equal(error.filename, join(fs.basePath, 'master.edge'))
      assert.equal(error.line, 1)
      assert.equal(error.col, 8)
    }
  })

  test('compile errors parent template must point to the right file', async ({ assert }) => {
    assert.plan(3)

    await fs.add(
      'master.edge',
      dedent`
      {{ username }}
      @!section('content')
    `
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      new Processor()
    )

    try {
      compiler.compileRaw(dedent`
      @layout('master')
      @section('content')
        {{ con tent }}
      @endsection
    `)
    } catch (error) {
      assert.equal(error.filename, 'eval.edge')
      assert.equal(error.line, 3)
      assert.equal(error.col, 9)
    }
  })

  test('runtime errors inside layout must point to the right file', async ({ assert }) => {
    assert.plan(4)

    await fs.add(
      'master.edge',
      dedent`
      {{ getUserName() }}
      @!section('content')
    `
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      new Processor()
    )

    try {
      const fn = compiler.compileRaw(dedent`
      @layout('master')
      @section('content')
        {{ content }}
      @endsection
    `).template
      new Function('template', 'state', fn)(new Template(compiler, {}, {}, new Processor()), {})
    } catch (error) {
      assert.equal(error.message, 'getUserName is not a function')
      assert.equal(error.filename, join(fs.basePath, 'master.edge'))
      assert.equal(error.line, 1)
      assert.equal(error.col, 0)
    }
  })

  test('runtime errors inside parent template must point to the right file', async ({ assert }) => {
    assert.plan(4)

    await fs.add(
      'master.edge',
      dedent`
    {{ username }}
    @!section('content')
    `
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      new Processor()
    )

    try {
      const fn = compiler.compileRaw(dedent`
      @layout('master')
      @section('content')
        {{ getContent() }}
      @endsection
      `).template
      new Function('template', 'state', fn)(new Template(compiler, {}, {}, new Processor()), {})
    } catch (error) {
      assert.equal(error.message, 'getContent is not a function')
      assert.equal(error.filename, 'eval.edge')
      assert.equal(error.line, 3)
      assert.equal(error.col, 0)
    }
  })
})

test.group('Compiler | Processor', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('execute raw processor function', async ({ assert }) => {
    assert.plan(2)
    await fs.add('index.edge', dedent`Hello`)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const processor = new Processor()
    processor.process('raw', ({ raw, path }) => {
      assert.equal(raw, 'Hello')
      assert.equal(path, join(fs.basePath, 'index.edge'))
    })

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      processor
    )

    compiler.compile('index')
  })

  test('use return value of the processor function', async ({ assert }) => {
    assert.plan(5)
    await fs.add('index.edge', dedent`Hello`)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const processor = new Processor()
    processor.process('raw', ({ raw, path }) => {
      assert.equal(raw, 'Hello')
      assert.equal(path, join(fs.basePath, 'index.edge'))
      return 'Hi'
    })

    processor.process('raw', ({ raw, path }) => {
      assert.equal(raw, 'Hi')
      assert.equal(path, join(fs.basePath, 'index.edge'))
      return 'Hey'
    })

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      processor
    )

    assert.stringEqual(
      compiler.compile('index.edge').template,
      normalizeNewLines(dedent`let out = "";
      let $lineNumber = 1;
      let $filename = ${stringify(join(fs.basePath, 'index.edge'))};
      try {
      out += "Hey";
      } catch (error) {
      template.reThrow(error, $filename, $lineNumber);
      }
      return out;
    `)
    )
  })

  test('do not run raw processor when template is cached', async ({ assert }) => {
    assert.plan(2)
    await fs.add('index.edge', dedent`Hello`)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const processor = new Processor()
    processor.process('raw', ({ raw, path }) => {
      assert.equal(raw, 'Hello')
      assert.equal(path, join(fs.basePath, 'index.edge'))
    })

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      processor,
      { cache: true }
    )

    compiler.compile('index.edge')
    compiler.compile('index.edge')
    compiler.compile('index.edge')
  })

  test('run raw processor function when template is not cached', async ({ assert }) => {
    assert.plan(6)
    await fs.add('index.edge', dedent`Hello`)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const processor = new Processor()
    processor.process('raw', ({ raw, path }) => {
      assert.equal(raw, 'Hello')
      assert.equal(path, join(fs.basePath, 'index.edge'))
    })

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      processor,
      { cache: false }
    )

    compiler.compile('index.edge')
    compiler.compile('index.edge')
    compiler.compile('index.edge')
  })

  test('run compiled processor function', async ({ assert }) => {
    assert.plan(2)
    await fs.add('index.edge', dedent`Hello`)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const processor = new Processor()
    processor.process('compiled', ({ compiled, path }) => {
      assert.stringEqual(
        compiled,
        normalizeNewLines(dedent`let out = "";
		      let $lineNumber = 1;
		      let $filename = ${stringify(join(fs.basePath, 'index.edge'))};
		      try {
		      out += "Hello";
		      } catch (error) {
		      template.reThrow(error, $filename, $lineNumber);
		      }
		      return out;
		    `)
      )
      assert.equal(path, join(fs.basePath, 'index.edge'))
    })

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      processor
    )

    compiler.compile('index.edge')
  })

  test('use return value of the compiled processor function', async ({ assert }) => {
    assert.plan(5)
    await fs.add('index.edge', dedent`Hello`)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const processor = new Processor()
    processor.process('compiled', ({ compiled, path }) => {
      assert.stringEqual(
        compiled,
        normalizeNewLines(dedent`let out = "";
		      let $lineNumber = 1;
		      let $filename = ${stringify(join(fs.basePath, 'index.edge'))};
		      try {
		      out += "Hello";
		      } catch (error) {
		      template.reThrow(error, $filename, $lineNumber);
		      }
		      return out;
    		`)
      )
      assert.equal(path, join(fs.basePath, 'index.edge'))
      return 'foo'
    })

    processor.process('compiled', ({ compiled, path }) => {
      assert.equal(compiled, 'foo')
      assert.equal(path, join(fs.basePath, 'index.edge'))
      return 'bar'
    })

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      processor
    )

    assert.equal(compiler.compile('index.edge').template, 'bar')
  })

  test('run compiled processor function even when template is cached', async ({ assert }) => {
    assert.plan(6)
    await fs.add('index.edge', dedent`Hello`)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const processor = new Processor()
    processor.process('compiled', ({ compiled, path }) => {
      assert.stringEqual(
        compiled,
        normalizeNewLines(dedent`let out = "";
		      let $lineNumber = 1;
		      let $filename = ${stringify(join(fs.basePath, 'index.edge'))};
		      try {
		      out += "Hello";
		      } catch (error) {
		      template.reThrow(error, $filename, $lineNumber);
		      }
		      return out;
		    `)
      )
      assert.equal(path, join(fs.basePath, 'index.edge'))
    })

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      processor,
      { cache: true }
    )

    compiler.compile('index.edge')
    compiler.compile('index.edge')
    compiler.compile('index.edge')
  })

  test('do not mutate cache when compiled processor function returns a different value', async ({
    assert,
  }) => {
    assert.plan(9)
    await fs.add('index.edge', dedent`Hello`)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const processor = new Processor()
    processor.process('compiled', ({ compiled, path }) => {
      assert.stringEqual(
        compiled,
        normalizeNewLines(dedent`let out = "";
		      let $lineNumber = 1;
		      let $filename = ${stringify(join(fs.basePath, 'index.edge'))};
		      try {
		      out += "Hello";
		      } catch (error) {
		      template.reThrow(error, $filename, $lineNumber);
		      }
		      return out;
		    `)
      )
      assert.equal(path, join(fs.basePath, 'index.edge'))
      return 'foo'
    })

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      processor,
      { cache: true }
    )

    assert.equal(compiler.compile('index.edge').template, 'foo')
    assert.equal(compiler.compile('index.edge').template, 'foo')
    assert.equal(compiler.compile('index.edge').template, 'foo')
  })

  test('run raw processor function for layouts', async ({ assert }) => {
    assert.plan(5)

    await fs.add(
      'master.edge',
      dedent`
      {{ username }}
      @!section('content')
    `
    )

    await fs.add(
      'index.edge',
      dedent`
      @layout('master')
      @section('content')
        {{ content }}
      @endsection
    `
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    let iteration = 0

    const processor = new Processor()
    processor.process('raw', ({ raw, path }) => {
      iteration++

      if (iteration === 1) {
        assert.equal(
          raw,
          dedent`@layout('master')
			      @section('content')
			        {{ content }}
			      @endsection`
        )
        assert.equal(path, join(fs.basePath, 'index.edge'))
        return
      }

      if (iteration === 2) {
        assert.equal(
          raw,
          dedent`{{ username }}
      			@!section('content')
      		`
        )
        assert.equal(path, join(fs.basePath, 'master.edge'))
        return
      }
    })

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      processor
    )

    assert.stringEqual(
      compiler.compile('index.edge').template,
      normalizeNewLines(dedent`let out = "";
      let $lineNumber = 1;
      let $filename = ${stringify(join(fs.basePath, 'index.edge'))};
      try {
      $filename = ${stringify(join(fs.basePath, 'master.edge'))};
      out += \`\${template.escape(state.username)}\`;
      out += "\\n";
      out += "  ";
      $filename = ${stringify(join(fs.basePath, 'index.edge'))};
      $lineNumber = 3;
      out += \`\${template.escape(state.content)}\`;
      } catch (error) {
      template.reThrow(error, $filename, $lineNumber);
      }
      return out;
    `)
    )
  })

  test('run compiled processor functions for layouts', async ({ assert }) => {
    assert.plan(3)

    await fs.add(
      'master.edge',
      dedent`
      {{ username }}
      @!section('content')
    `
    )

    await fs.add(
      'index.edge',
      dedent`
      @layout('master')
      @section('content')
        {{ content }}
      @endsection
    `
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const processor = new Processor()
    processor.process('compiled', ({ compiled, path }) => {
      assert.stringEqual(
        compiled,
        normalizeNewLines(dedent`let out = "";
		      let $lineNumber = 1;
		      let $filename = ${stringify(join(fs.basePath, 'index.edge'))};
		      try {
		      $filename = ${stringify(join(fs.basePath, 'master.edge'))};
		      out += \`\${template.escape(state.username)}\`;
		      out += "\\n";
		      out += "  ";
		      $filename = ${stringify(join(fs.basePath, 'index.edge'))};
		      $lineNumber = 3;
		      out += \`\${template.escape(state.content)}\`;
		      } catch (error) {
		      template.reThrow(error, $filename, $lineNumber);
		      }
		      return out;
		    `)
      )
      assert.equal(path, join(fs.basePath, 'index.edge'))
    })

    const compiler = new Compiler(
      loader,
      {
        section: sectionTag,
        layout: layoutTag,
      },
      processor
    )

    assert.stringEqual(
      compiler.compile('index.edge').template,
      normalizeNewLines(dedent`let out = "";
      let $lineNumber = 1;
      let $filename = ${stringify(join(fs.basePath, 'index.edge'))};
      try {
      $filename = ${stringify(join(fs.basePath, 'master.edge'))};
      out += \`\${template.escape(state.username)}\`;
      out += "\\n";
      out += "  ";
      $filename = ${stringify(join(fs.basePath, 'index.edge'))};
      $lineNumber = 3;
      out += \`\${template.escape(state.content)}\`;
      } catch (error) {
      template.reThrow(error, $filename, $lineNumber);
      }
      return out;
    `)
    )
  })

  test('run tag processor function', async ({ assert }) => {
    await fs.add(
      'modal.edge',
      dedent`
			This is a modal
    	`
    )

    await fs.add(
      'index.edge',
      dedent`
			@hl.modal()
			@end
    	`
    )

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const processor = new Processor()
    processor.process('tag', ({ tag }) => {
      if (tag.properties.name === 'hl.modal') {
        tag.properties.name = 'component'
        tag.properties.jsArg = `'modal'`
      }
    })

    const compiler = new Compiler(
      loader,
      {
        component: componentTag,
      },
      processor
    )

    compiler.claimTag((name) => {
      if (name === 'hl.modal') {
        return { seekable: true, block: true }
      }
      return null
    })

    assert.stringEqual(
      compiler.compile('index.edge').template,
      normalizeNewLines(dedent`let out = "";
      let $lineNumber = 1;
      let $filename = ${stringify(join(fs.basePath, 'index.edge'))};
      try {
      out += template.compileComponent('modal')(template, template.getComponentState({}, { $context: Object.assign({}, $context), main: function () { return \"\" } }, { filename: $filename, line: $lineNumber, col: 0 }), $context);
      } catch (error) {
      template.reThrow(error, $filename, $lineNumber);
      }
      return out;
    `)
    )
  })
})
