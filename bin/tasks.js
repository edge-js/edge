'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const shell = require('shelljs')
const ygor = require('ygor')
const semver = require('semver')
const path = require('path')

const HAS_ASYNC_SUPPORT = semver.satisfies(process.version, '>7.0')
const BIN = HAS_ASYNC_SUPPORT ? 'node --harmony-async-await' : 'node'
const COVERALLS_BIN = './node_modules/.bin/coveralls'
const COVERAGE_DIR = `${path.join(__dirname, '../coverage')}`
const COVERAGE_FILE = `${path.join(COVERAGE_DIR, 'lcov.info')}`

/**
 * Runs test safely without knowing the required
 * harmony flags. This command should be consumed
 * internally.
 */
ygor.task('test:safe', () => {
  require('require-all')({
    dirname: path.join(__dirname, '../test'),
    filter: function (fileName) {
      if (!HAS_ASYNC_SUPPORT) {
        return !fileName.includes('async.spec.js') && fileName.endsWith('spec.js')
      }
      return fileName.endsWith('spec.js')
    }
  })
})

/**
 * Runs test suite by adding the harmony async/await
 * flag.
 */
ygor.task('test:local', () => {
  if (shell.exec(`FORCE_COLOR=true ${BIN} bin/tasks.js test:safe`).code !== 0) {
    shell.echo('test:local command failed')
    shell.exit(1)
  }
})

/**
 * Same as test:local, but leaving space if any future
 * customizations are required on windows. Also we
 * will rely on travis to report coverage report
 * to coveralls.
 */
ygor.task('test:win', () => {
  if (shell.exec(`FORCE_COLOR=true ${BIN} bin/tasks.js test:safe`).code !== 0) {
    shell.echo('test:win command failed')
    shell.exit(1)
  }
})

/**
 * Same as test local, instead it will report the
 * coverage info to coveralls. You may need to pass
 * SECRETS for coveralls account, but it's better
 * to let Travis do that for you.
 */
ygor.task('test', () => {
  const command = `FORCE_COLOR=true ${BIN} ./node_modules/.bin/istanbul cover --hook-run-in-context -x bin/tasks.js bin/tasks.js test:safe && cat ${COVERAGE_FILE} | ${COVERALLS_BIN} && rm -rf ${COVERAGE_DIR}`

  if (shell.exec(command).code !== 0) {
    shell.echo('test command failed')
    shell.exit(1)
  }
})

/**
 * Runs test and reports coverage to a local
 * directory to be viewed by the developer.
 */
ygor.task('coverage', () => {
  const command = `FORCE_COLOR=true ${BIN} ./node_modules/.bin/istanbul cover --hook-run-in-context -x bin/tasks.js bin/tasks.js test:safe`

  if (shell.exec(command).code !== 0) {
    shell.echo('coverage command failed')
    shell.exit(1)
  }
})
