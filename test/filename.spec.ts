/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import './assert_extend.js'
import { test } from '@japa/runner'
import { join } from 'node:path'
import dedent from 'dedent-js'

import { Edge } from '../src/edge/index.js'
import { normalizeNewLines } from '../test_helpers/index.js'

test.group('Template FileName', () => {
  test('print file absolute path', async ({ assert, fs }) => {
    await fs.create('foo.edge', '{{ $filename }}')

    const edge = new Edge()
    edge.mount(fs.basePath)

    const output = await edge.render('foo', {})
    assert.equal(output.trim(), join(fs.basePath, 'foo.edge'))
  })

  test('print file absolute path inside a partial', async ({ assert, fs }) => {
    await fs.create(
      'foo.edge',
      dedent`
			@include('bar')
			{{ $filename }}
		`
    )
    await fs.create('bar.edge', '{{ $filename }}')

    const edge = new Edge()
    edge.mount(fs.basePath)

    const output = await edge.render('foo', {})

    assert.stringEqual(
      output.trim(),
      normalizeNewLines(dedent`
				${join(fs.basePath, 'bar.edge')}
				${join(fs.basePath, 'foo.edge')}
			`)
    )
  })

  test('print file absolute path inside a layout', async ({ assert, fs }) => {
    await fs.create(
      'foo.edge',
      dedent`
			@layout('master')
			@section('content')
				@super
				{{ $filename }}
			@endsection
		`
    )

    await fs.create(
      'master.edge',
      dedent`
			@section('content')
				{{ $filename }}
			@endsection
		`
    )

    const edge = new Edge()
    edge.mount(fs.basePath)

    const output = await edge.render('foo', {})

    assert.stringEqual(
      output.trim(),
      normalizeNewLines(dedent`
				${join(fs.basePath, 'master.edge')}
					${join(fs.basePath, 'foo.edge')}
			`)
    )
  })

  test('print file absolute path inside a partial', async ({ assert, fs }) => {
    await fs.create(
      'foo.edge',
      dedent`
			@include('bar')
			{{ $filename }}
		`
    )
    await fs.create('bar.edge', '{{ $filename }}')

    const edge = new Edge()
    edge.mount(fs.basePath)

    const output = await edge.render('foo', {})

    assert.stringEqual(
      output.trim(),
      normalizeNewLines(dedent`
				${join(fs.basePath, 'bar.edge')}
				${join(fs.basePath, 'foo.edge')}
			`)
    )
  })

  test('print file absolute path inside a component', async ({ assert, fs }) => {
    await fs.create(
      'foo.edge',
      dedent`
			@component('button')
				@slot('text')
				{{ $filename }}
				@endslot
			@endcomponent
		`
    )

    await fs.create(
      'button.edge',
      dedent`
			{{{ await $slots.text() }}}
			{{ $filename }}
		`
    )

    const edge = new Edge()
    edge.mount(fs.basePath)

    const output = await edge.render('foo', {})

    assert.stringEqual(
      output.trim(),
      normalizeNewLines(dedent`
				${join(fs.basePath, 'foo.edge')}
				${join(fs.basePath, 'button.edge')}
			`)
    )
  })
})
