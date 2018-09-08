import { expect } from 'chai'
import { describe, it } from 'mocha'
import gravity from './gravity'
import { create } from './index'
import * as utils from './utils'

describe(`gravity`, () => {

  it(`should do nothing when nothing is purged`, () => {
    const board = create({
      colorsCount: 7,
      height: 4,
      width: 4,
      prng: [
        1, 2, 3, 4,
        0, 2, 3, 4,
        4, 3, 1, 1,
        4, 3, 1, 1,
      ][Symbol.iterator](),
    })
    const before = utils.cloneMatrix(board.data)
    expect(gravity(board, [])).to.deep.eq({
      items: [],
      columnMissingCounts: [0, 0, 0, 0],
    })
    expect(board.data).to.deep.eq(before)
  })

  it(`should purge a horizontal line and accept new things from above`, () => {
    const board = create({
      colorsCount: 7,
      height: 4,
      width: 4,
      prng: [
        1, 0, 1, 0,
        0, 2, 3, 4,
        4, 3, 1, 1,
        4, 3, 1, 1,
        // new
        0, 1, 2,
      ][Symbol.iterator](),
    })
    expect(gravity(board, [
      { i: 0, j: 1 },
      { i: 0, j: 2 },
      { i: 0, j: 3 },
    ])).to.deep.eq({
      items: [
        { coord: { i: 1, j: 1 }, by: 1 },
        { coord: { i: 2, j: 1 }, by: 1 },
        { coord: { i: 3, j: 1 }, by: 1 },
        { coord: { i: 1, j: 2 }, by: 1 },
        { coord: { i: 2, j: 2 }, by: 1 },
        { coord: { i: 3, j: 2 }, by: 1 },
        { coord: { i: 1, j: 3 }, by: 1 },
        { coord: { i: 2, j: 3 }, by: 1 },
        { coord: { i: 3, j: 3 }, by: 1 },
      ],
      columnMissingCounts: [0, 1, 1, 1],
    })
    expect(board.data).to.deep.eq([
      [1, 2, 3, 4],
      [0, 3, 1, 1],
      [4, 3, 1, 1],
      [4, 0, 1, 2],
    ])
  })

})
