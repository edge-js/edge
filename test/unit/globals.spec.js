'use strict'

const test = require('japa')
const Globals = require('../../src/Globals')

test.group('Globals', () => {
  test('return safe element object when .el global is called', (assert) => {
    const context = {
      safe (input) {
        return input
      }
    }
    const output = Globals.el.bind(context)('<a href="$url"> $title </a>', { title: 'Docs', url: '/docs' })
    assert.equal(output, '<a href="/docs"> Docs </a>')
  })

  test('replace with nested objects', (assert) => {
    const context = {
      safe (input) {
        return input
      }
    }
    const output = Globals.el.bind(context)('<a href="$meta.url"> $meta.title </a>', { meta: {title: 'Docs', url: '/docs'} })
    assert.equal(output, '<a href="/docs"> Docs </a>')
  })

  test('replace with nested objects inside an array', (assert) => {
    const context = {
      safe (input) {
        return input
      }
    }
    const output = Globals.el.bind(context)('<a href="$meta.0.url"> $meta.0.title </a>', { meta: [{title: 'Docs', url: '/docs'}] })
    assert.equal(output, '<a href="/docs"> Docs </a>')
  })

  test('convert a link to an anchor tag', (assert) => {
    const context = {
      safe (input) {
        return input
      }
    }
    const output = Globals.toAnchor.bind(context)('http://google.com')
    assert.equal(output, '<a href="http://google.com"> http://google.com </a>')
  })

  test('convert a link to an anchor tag with custom title', (assert) => {
    const context = {
      safe (input) {
        return input
      }
    }
    const output = Globals.toAnchor.bind(context)('http://google.com', 'Google')
    assert.equal(output, '<a href="http://google.com"> Google </a>')
  })

  test('encode url', (assert) => {
    const output = Globals.urlEncode('http://foo.com?username=aman virk')
    assert.equal(output, 'http://foo.com?username=aman%20virk')
  })

  test('self should return the entire hash back', (assert) => {
    const context = {
      safe (input) {
        return input
      }
    }
    const output = Globals.el.bind(context)('$self', 'Hello')
    assert.equal(output, 'Hello')
  })

  test('render when if value is true', (assert) => {
    const context = {
      safe (input) {
        return input
      }
    }
    const output = Globals.elIf.bind(context)('Hello $name', { name: 'virk' }, true)
    assert.equal(output, 'Hello virk')
  })

  test('return empty string when elIf boolean is false', (assert) => {
    const context = {
      safe (input) {
        return input
      }
    }
    const output = Globals.elIf.bind(context)('Hello $name', { name: 'virk' }, false)
    assert.equal(output, '')
  })
})
