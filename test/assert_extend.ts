import { Assert } from '@japa/assert'

declare module '@japa/assert' {
  interface Assert {
    stringEqual(actual: string, expected: string, message?: string): void
  }
}

Assert.macro(
  'stringEqual',
  function (this: Assert, actual: string, expected: string, msg?: string) {
    this.incrementAssertionsCount()
    return new this.Assertion(actual.split(/\r\n|\n/), msg).to.deep.equal(expected.split(/\r\n|\n/))
  }
)
