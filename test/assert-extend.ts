import { Assert } from 'japa/build/src/Assert'

declare module 'japa/build/src/Assert' {
  interface Assert {
    stringEqual (actual: string, expected: string)
  }
}

Assert.use((chai) => {
  chai.assert.stringEqual = function stringEqual (val, exp, msg) {
    new chai.Assertion(val.split(/\r\n|\n/g), msg).to.deep.equal(exp.split(/\r\n|\n/g))
  }
})
