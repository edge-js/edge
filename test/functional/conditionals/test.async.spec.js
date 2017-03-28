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

Browser.localhost('localhost', PORT)

test.group('Functional | Conditionals', (group) => {
  group.before(() => {
    edgeServer(viewsPath, PORT)
  })

  test('simple if statement', async (assert) => {
    const browser = new Browser()
    await browser.visit('simple-if-else')
    const $ = cheerio.load(browser.html())
    assert.equal($('.title').text().trim(), 'Hello anonymous')
  })

  test('write username when passed', async (assert) => {
    const browser = new Browser()
    await browser.visit('simple-if-else?username=virk')
    const $ = cheerio.load(browser.html())
    assert.equal($('.title').text().trim(), 'Hello virk')
  })

  test('output if block when username is virk', async (assert) => {
    const browser = new Browser()
    await browser.visit('if-else?username=virk')
    const $ = cheerio.load(browser.html())
    assert.equal($('.title').length, 1)
    assert.equal($('.title').text().trim(), 'Hey Virk')
  })

  test('output else if block when username is nikk', async (assert) => {
    const browser = new Browser()
    await browser.visit('if-else?username=nikk')
    const $ = cheerio.load(browser.html())
    assert.equal($('.title').length, 1)
    assert.equal($('.title').text().trim(), 'Hello Nikk')
  })

  test('output else if block when username is joe', async (assert) => {
    const browser = new Browser()
    await browser.visit('if-else?username=joe')
    const $ = cheerio.load(browser.html())
    assert.equal($('.title').length, 1)
    assert.equal($('.title').text().trim(), 'Heya Joe')
  })

  test('output nothing when there is no username', async (assert) => {
    const browser = new Browser()
    await browser.visit('if-else')
    const $ = cheerio.load(browser.html())
    assert.equal($('.title').length, 0)
  })

  test('output nothing when there is no username', async (assert) => {
    const browser = new Browser()
    await browser.visit('if-else')
    const $ = cheerio.load(browser.html())
    assert.equal($('.title').length, 0)
  })

  test('output else when name does not starts with v or n', async (assert) => {
    const browser = new Browser()
    await browser.visit('complex-if-else?username=k')
    const $ = cheerio.load(browser.html())
    assert.equal($('.title').length, 1)
    assert.equal($('.title').text().trim(), 'Your name does not start with v or n')
  })

  test('throw exception with correct lineno and charno when there is an error', async (assert) => {
    const browser = new Browser()
    await browser.visit('error-if-else')
    const $ = cheerio.load(browser.html())
    const error = JSON.parse($('body').text())
    assert.equal(error.name, 'InvalidExpressionException')
    assert.equal(error.stack.split('\n')[1].trim(), `at (${path.join(viewsPath, 'error-if-else.edge')}:9:0)`)
  })
})
