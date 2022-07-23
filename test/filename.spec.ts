/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { join } from 'path'
import dedent from 'dedent-js'
import { Filesystem } from '@poppinss/dev-utils'

import { Edge } from '../src/Edge'
import { normalizeNewLines } from '../test-helpers'

import './assert-extend'

const fs = new Filesystem(join(__dirname, 'views'))

test.group('Template FileName', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('print file absolute path', async ({ assert }) => {
    await fs.add('foo.edge', '{{ $filename }}')

    const edge = new Edge()
    edge.mount(fs.basePath)

    const output = await edge.render('foo', {})
    assert.equal(output.trim(), join(fs.basePath, 'foo.edge'))
  })

  test('print file absolute path inside a partial', async ({ assert }) => {
    await fs.add(
      'foo.edge',
      dedent`
			@include('bar')
			{{ $filename }}
		`
    )
    await fs.add('bar.edge', '{{ $filename }}')

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

  test('print file absolute path inside a layout', async ({ assert }) => {
    await fs.add(
      'foo.edge',
      dedent`
			@layout('master')
			@section('content')
				@super
				{{ $filename }}
			@endsection
		`
    )

    await fs.add(
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

  test('print file absolute path inside a partial', async ({ assert }) => {
    await fs.add(
      'foo.edge',
      dedent`
			@include('bar')
			{{ $filename }}
		`
    )
    await fs.add('bar.edge', '{{ $filename }}')

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

  test('print file absolute path inside a component', async ({ assert }) => {
    await fs.add(
      'foo.edge',
      dedent`
			@component('button')
				@slot('text')
				{{ $filename }}
				@endslot
			@endcomponent
		`
    )

    await fs.add(
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
