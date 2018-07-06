require('ts-node/register')

const cli = require('japa/cli')
const Assertion = require('japa/api').Assertion
const os = require('os')

Assertion.use((chai, utils) => {
  chai.assert.stringEqual = function (val, exp, msg) {
    new chai.Assertion(val.split(/\r\n|\n/), msg).to.deep.equal(exp.split(/\r\n|\n/))
  }
})

cli.run('test/edge.spec.ts')
