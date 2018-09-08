import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as maths from './maths'
import * as utils from './utils'

function almostEquals (a: number[], b: number[]) {
  expect(a.length == b.length).to.be.true
  for (let i = 0; i < a.length; i++) {
    expect(utils.fpge(a[i], b[i])).to.be.true
  }
}

describe(`math`, () => {

  describe(`getNotch`, () => {

    it(`divides [0, 1) in 2 parts`, () => {
      almostEquals(maths.getNotches(2), [0, 0.5])
    })
  
    it(`divides [0, 1) in 3 parts`, () => {
      almostEquals(maths.getNotches(3), [0, .33, .66])
    })

    it(`divides [0, 4) in 4 parts`, () => {
      almostEquals(maths.getNotches(4, 4), [0, 1, 2, 3])
    })

    it(`divides [1, 6) in 5 parts`, () => {
      almostEquals(maths.getNotches(5, 6, 1), [1, 2, 3, 4, 5])
    })
  
  })

})
