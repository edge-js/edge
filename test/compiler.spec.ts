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
import dedent from 'dedent-js'
import stringify from 'js-stringify'
import { Filesystem } from '@poppinss/dev-utils'
import { TagTypes, MustacheTypes } from 'edge-lexer'

import { Loader } from '../src/Loader'
import { Context } from '../src/Context'
import { setTag } from '../src/Tags/Set'
import { Compiler } from '../src/Compiler'
import { layoutTag } from '../src/Tags/Layout'
import { sectionTag } from '../src/Tags/Section'
import { normalizeNewLines } from '../test-helpers'

import './assert-extend'

const fs = new Filesystem(join(__dirname, 'views'))

test.group('Compiler | Cache', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('compile template', async (assert) => {
    await fs.add('foo.edge', 'Hello {{ username }}')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, {})
    const { template } = compiler.compile('foo')

    assert.stringEqual(template, normalizeNewLines(dedent`let out = "";
      let $lineNumber = 1;
      let $filename = ${stringify(join(fs.basePath, 'foo.edge'))};
      try {
      out += "\\n";
      out += "Hello ";
      out += \`\${ctx.escape(state.username)}\`;
      } catch (error) {
      ctx.reThrow(error, $filename, $lineNumber);
      }
      return out;`))
  })

  test('save template to cache when caching is turned on', async (assert) => {
    await fs.add('foo.edge', 'Hello {{ username }}')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, {}, true)
    assert.equal(
      compiler.compile('foo').template,
      compiler.cacheManager.get(join(fs.basePath, 'foo.edge'))!.template,
    )
  })

  test('do not cache template when caching is turned off', async (assert) => {
    await fs.add('foo.edge', 'Hello {{ username }}')

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, {}, false)
    compiler.compile('foo')
    assert.isUndefined(compiler.cacheManager.get(join(fs.basePath, 'foo.edge')))
  })
})

test.group('Compiler | Tokenize', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('during tokenize, merge @section tags of a given layout', async (assert) => {
    await fs.add('master.edge', dedent`
      Master page
      @!section('content')
    `)

    await fs.add('index.edge', dedent`
      @layout('master')
      @section('content')
        Hello world
      @endsection
    `)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, {
      section: sectionTag,
      layout: layoutTag,
    })

    assert.deepEqual(compiler.tokenize('index.edge'), [
      {
        type: 'newline' as const,
        line: 0,
        filename: join(fs.basePath, 'master.edge'),
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
        properties: { name: 'section', jsArg: '\'content\'', selfclosed: false },
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

  test('during tokenize, merge @set tags of a given layout', async (assert) => {
    await fs.add('master.edge', dedent`
      Master page
      @!section('content')
    `)

    await fs.add('index.edge', dedent`
      @layout('master')
      @set('username', 'virk')
      @section('content')
        Hello world
      @endsection
    `)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, {
      section: sectionTag,
      layout: layoutTag,
      set: setTag,
    })

    assert.deepEqual(compiler.tokenize('index.edge'), [
      {
        type: TagTypes.TAG,
        filename: join(fs.basePath, 'index.edge'),
        properties: { name: 'set', jsArg: '\'username\', \'virk\'', selfclosed: false },
        loc: {
          start: { line: 2, col: 5 },
          end: { line: 2, col: 24 },
        },
        children: [],
      },
      {
        type: 'newline' as const,
        line: 0,
        filename: join(fs.basePath, 'master.edge'),
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
        properties: { name: 'section', jsArg: '\'content\'', selfclosed: false },
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

  test('ensure template extending layout can only use section or set tags', async (assert) => {
    assert.plan(4)

    await fs.add('master.edge', dedent`
      Master page
      @!section('content')
    `)

    await fs.add('index.edge', dedent`
      @layout('master')
      Hello world
    `)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, {
      section: sectionTag,
      layout: layoutTag,
    })

    try {
      compiler.tokenize('index.edge')
    } catch (error) {
      assert.equal(
        error.message,
        'Template extending a layout can only use "@section" or "@set" tags as top level nodes',
      )
      assert.equal(error.filename, join(fs.basePath, 'index.edge'))
      assert.equal(error.line, 2)
      assert.equal(error.col, 0)
    }
  })

  test('during tokenize, merge @section tags of a nested layouts', async (assert) => {
    await fs.add('super-master.edge', dedent`
      Master page
      @!section('header')
      @!section('content')
    `)

    await fs.add('master.edge', dedent`
      @layout('super-master')
      @section('header')
        This is header
      @endsection
      @!section('content')
    `)

    await fs.add('index.edge', dedent`
      @layout('master')
      @section('content')
        This is content
      @endsection
    `)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, {
      section: sectionTag,
      layout: layoutTag,
    })

    assert.deepEqual(compiler.tokenize('index.edge'), [
      {
        type: 'newline' as const,
        line: 0,
        filename: join(fs.basePath, 'super-master.edge'),
      },
      {
        type: 'raw' as const,
        value: 'Master page',
        line: 1,
        filename: join(fs.basePath, 'super-master.edge'),
      },
      {
        type: TagTypes.TAG,
        filename: join(fs.basePath, 'master.edge'),
        properties: { name: 'section', jsArg: '\'header\'', selfclosed: false },
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
        type: TagTypes.TAG,
        filename: join(fs.basePath, 'index.edge'),
        properties: { name: 'section', jsArg: '\'content\'', selfclosed: false },
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

  test('layout tokens must point to its own filename', async (assert) => {
    await fs.add('master.edge', dedent`
      {{ username }}
      @!section('content')
    `)

    await fs.add('index.edge', dedent`
      @layout('master')
      @section('content')
        Hello world
      @endsection
    `)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, {
      section: sectionTag,
      layout: layoutTag,
    })

    assert.deepEqual(compiler.tokenize('index.edge'), [
      {
        type: 'newline' as const,
        line: 0,
        filename: join(fs.basePath, 'master.edge'),
      },
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
        properties: { name: 'section', jsArg: '\'content\'', selfclosed: false },
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
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('compile template with layouts', async (assert) => {
    await fs.add('master.edge', dedent`
      {{ username }}
      @!section('content')
    `)

    await fs.add('index.edge', dedent`
      @layout('master')
      @section('content')
        {{ content }}
      @endsection
    `)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, {
      section: sectionTag,
      layout: layoutTag,
    })

    assert.stringEqual(compiler.compile('index.edge').template, normalizeNewLines(dedent`let out = "";
      let $lineNumber = 1;
      let $filename = ${stringify(join(fs.basePath, 'index.edge'))};
      try {
      out += "\\n";
      $filename = ${stringify(join(fs.basePath, 'master.edge'))};
      out += \`\${ctx.escape(state.username)}\`;
      out += "\\n";
      out += "  ";
      $filename = ${stringify(join(fs.basePath, 'index.edge'))};
      $lineNumber = 3;
      out += \`\${ctx.escape(state.content)}\`;
      } catch (error) {
      ctx.reThrow(error, $filename, $lineNumber);
      }
      return out;
    `))
  })

  test('compile errors inside layout must point to the right file', async (assert) => {
    assert.plan(3)

    await fs.add('master.edge', dedent`
      {{ user name }}
      @!section('content')
    `)

    await fs.add('index.edge', dedent`
      @layout('master')
      @section('content')
        {{ content }}
      @endsection
    `)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, {
      section: sectionTag,
      layout: layoutTag,
    })

    try {
      compiler.compile('index.edge')
    } catch (error) {
      assert.equal(error.filename, join(fs.basePath, 'master.edge'))
      assert.equal(error.line, 1)
      assert.equal(error.col, 8)
    }
  })

  test('compile errors parent template must point to the right file', async (assert) => {
    assert.plan(3)

    await fs.add('master.edge', dedent`
      {{ username }}
      @!section('content')
    `)

    await fs.add('index.edge', dedent`
      @layout('master')
      @section('content')
        {{ con tent }}
      @endsection
    `)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, {
      section: sectionTag,
      layout: layoutTag,
    })

    try {
      compiler.compile('index.edge')
    } catch (error) {
      assert.equal(error.filename, join(fs.basePath, 'index.edge'))
      assert.equal(error.line, 3)
      assert.equal(error.col, 9)
    }
  })

  test('runtime errors inside layout must point to the right file', async (assert) => {
    assert.plan(4)

    await fs.add('master.edge', dedent`
      {{ getUserName() }}
      @!section('content')
    `)

    await fs.add('index.edge', dedent`
      @layout('master')
      @section('content')
        {{ content }}
      @endsection
    `)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, {
      section: sectionTag,
      layout: layoutTag,
    })

    try {
      const fn = compiler.compile('index.edge').template
      console.log(fn.toString())
      new Function('state', 'ctx', fn)({}, new Context())
    } catch (error) {
      assert.equal(error.message, 'getUserName is not a function')
      assert.equal(error.filename, join(fs.basePath, 'master.edge'))
      assert.equal(error.line, 1)
      assert.equal(error.col, 0)
    }
  })

  test('runtime errors inside parent template must point to the right file', async (assert) => {
    assert.plan(4)

    await fs.add('master.edge', dedent`
    {{ username }}
    @!section('content')
    `)

    await fs.add('index.edge', dedent`
    @layout('master')
    @section('content')
      {{ getContent() }}
    @endsection
    `)

    const loader = new Loader()
    loader.mount('default', fs.basePath)

    const compiler = new Compiler(loader, {
      section: sectionTag,
      layout: layoutTag,
    })

    try {
      new Function('state', 'ctx', compiler.compile('index.edge').template)({}, new Context())
    } catch (error) {
      assert.equal(error.message, 'getContent is not a function')
      assert.equal(error.filename, join(fs.basePath, 'index.edge'))
      assert.equal(error.line, 3)
      assert.equal(error.col, 0)
    }
  })
})
