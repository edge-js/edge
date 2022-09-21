import { Assert } from '@japa/assert'
import { Assertion } from 'chai'

declare module '@japa/assert' {
  interface Assert {
    stringEqual(actual: string, expected: string)
  }
}

Assert.macro('stringEqual', function (actual: string, expected: string) {
  this.assertions.total++
  return new Assertion(actual.split(/\r\n|\n/)).to.deep.equal(expected.split(/\r\n|\n/))
})
