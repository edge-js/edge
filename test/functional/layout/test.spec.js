'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const path = require('path')
const test = require('japa')
const Browser = require('zombie')
const cheerio = require('cheerio')
const edgeServer = require('../../../test-helpers/edgeServer')
const viewsPath = path.join(__dirname, './views')
const PORT = 3333

test.group('Layout', (group) => {
  group.before(() => {
    edgeServer(viewsPath, PORT)
  })

  test('simple layout section statement', async (assert) => {
    const browser = new Browser()
    await browser.visit(`http://localhost:${PORT}/app`)
    const $ = cheerio.load(browser.html())
    assert.equal($('h1').text().trim(), 'Master Layout')
    assert.equal($('h2').text().trim(), 'App Layout')
  })

  test.failing('nested layout section statement', async (assert) => {
    const browser = new Browser()
    await browser.visit(`http://localhost:${PORT}/view`)
    const $ = cheerio.load(browser.html())
    assert.equal($('h1').text().trim(), 'Master Layout')
    assert.equal($('h2').text().trim(), 'App Layout')
    assert.equal($('h3').text().trim(), 'View')
  })
})
