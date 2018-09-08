import { expect } from 'chai'
import { describe, it } from 'mocha'
import * as board from './index'
import * as utils from './utils'
import { stripIndent } from 'common-tags'
import Ray, * as ray from './ray';
import Coord, * as coord from './coord'

const prng = (): Iterator<number> => {
  return [
    0, 2, 3, 3, 4, 1,
    2, 2, 0, 0, 3, 1,
    3, 0, 6, 1, 1, 2,
    2, 4, 1, 6, 1, 6,
    5, 5, 1, 1, 5, 4,
    6, 0, 6, 3, 0, 3,
  ][Symbol.iterator]()
}

describe(`utils`, () => {

  describe(`denormalize`, () => {

    it(`works for simple cases`, () => {
      expect(utils.denormalize(0.3, 2)).to.eq(0)
      expect(utils.denormalize(0.6, 2)).to.eq(1)
    })

    it(`works for extreme cases`, () => {
      expect(utils.denormalize(0.0, 7)).to.eq(0)
      expect(utils.denormalize(1.0, 7)).to.eq(6)
    })

    it(`works when on a boundary (goes to the left)`, () => {
      expect(utils.denormalize(0.5, 2)).to.eq(0)
    })

  })

})

describe(`Board`, () => {

  describe(`validateConfig`, () => {

    it(`returns back the config if there are no problems`, () => {
      const config: board.Config = {
        width: 6, height: 6, colorsCount: 6, prng: prng(),
      }
      const returned = board.validateConfig(config)
      expect(returned).to.eq(config)
    })

    it(`throws if there is a single error`, () => {
      const config: board.Config = {
        width: 1, height: 6, colorsCount: 5, prng: prng(),
      }
      const validate = () => board.validateConfig(config)
      expect(validate).to.throw(stripIndent`
        Config is invalid.
          Width has to be >= 6. Given value is 1.
      `)
    })

    it(`throws if there are a few errors`, () => {
      const config: board.Config = {
        width: 1, height: 2, colorsCount: 3, prng: prng(),
      }
      const validate = () => board.validateConfig(config)
      expect(validate).to.throw(stripIndent`
        Config is invalid.
          Width has to be >= 6. Given value is 1.
          Height has to be >= 6. Given value is 2.
          Colors count has to be >= 5. Given value is 3.
      `)
    })

  })

  describe(`create`, () => {

    it(`generates a new board`, () => {
      const config: board.Config = {
        width: 6,
        height: 6,
        colorsCount: 7,
        prng: prng(),
      }
      const game = board.create(config)
      const print = board.print(game)
      expect(print).to.eq(stripIndent`
        023341
        220031
        306112
        241616
        551154
        606303
      `)
    })

  })

})

describe(`Rays`, () => {

  const stable = [
    [4, 3, 1, 2, 4, 3, 1, 2],
    [0, 2, 6, 0, 6, 3, 3, 1],
    [3, 0, 5, 3, 1, 2, 1, 4],
    [2, 4, 1, 3, 4, 4, 5, 5],
    [0, 4, 6, 0, 6, 0, 4, 1],
    [2, 2, 1, 0, 1, 5, 0, 6],
    [6, 3, 4, 2, 3, 2, 3, 3],
    [0, 2, 3, 5, 6, 5, 1, 1],
  ]

  describe(`getHorizontalRays`, () => {

    it(`returns a single ray for one long ray`, () => {
      const data = [
        [0, 0, 0, 0, 0, 0],
      ]
      const expected: Ray[] = [{
        type: ray.Type.Horizontal,
        color: 0,
        length: 6,
        from: { i: 0, j: 0 },
        to: { i: 0, j: 5 },
      }]
      expect(ray.horizontal(data)).to.deep.eq(expected)
    })

    it(`returns two rays`, () => {
      const data = [
        [0, 0, 0, 1, 1, 1]
      ]
      const expected: Ray[] = [
        {
          type: ray.Type.Horizontal,
          color: 0,
          length: 3,
          from: { i: 0, j: 0 },
          to: { i: 0, j: 2 }
        },
        {
          type: ray.Type.Horizontal,
          color: 1,
          length: 3,
          from: { i: 0, j: 3 },
          to: { i: 0, j: 5 },
        },
      ]
      expect(ray.horizontal(data)).to.deep.eq(expected)
    })

    it(`returns nothing`, () => {
      const data = [
        [0, 1, 2, 3, 4, 5],
      ]
      const expected: Ray[] = []
      expect(ray.horizontal(data)).to.deep.eq(expected)
    })

    it(`returns two rays in separate rows`, () => {
      const data = [
        [0, 1, 2, 2, 2, 2],
        [2, 2, 2, 0, 1, 0],
      ]
      const expected: Ray[] = [
        {
          type: ray.Type.Horizontal,
          color: 2,
          length: 4,
          from: { i: 0, j: 2 },
          to: { i: 0, j: 5 },
        },
        {
          type: ray.Type.Horizontal,
          color: 2,
          length: 3,
          from: { i: 1, j: 0 },
          to: { i: 1, j: 2 },
        }
      ]
      expect(ray.horizontal(data)).to.deep.eq(expected)
    })

    it(`finds nothing in a stable example`, () => {
      expect(ray.horizontal(stable)).to.deep.eq([])
    })

  })

  describe(`getVerticalRays`, () => {

    it(`returns a single long array`, () => {
      const data = [
        [0],
        [0],
        [0],
        [0],
        [0],
        [0],
      ]
      const expected: Ray[] = [
        {
          type: ray.Type.Vertical,
          color: 0,
          length: 6,
          from: { i: 0, j: 0 },
          to: { i: 5, j: 0 },
        },
      ]
      expect(ray.vertical(data)).to.deep.eq(expected)
    })

    it(`returns two arrays`, () => {
      const data = [
        [0],
        [0],
        [0],
        [1],
        [1],
        [1],
      ]
      const expected: Ray[] = [
        {
          type: ray.Type.Vertical,
          color: 0,
          length: 3,
          from: { i: 0, j: 0 },
          to: { i: 2, j: 0 },
        },
        {
          type: ray.Type.Vertical,
          color: 1,
          length: 3,
          from: { i: 3, j: 0 },
          to: { i: 5, j: 0 },
        },
      ]
      expect(ray.vertical(data)).to.deep.eq(expected)
    })

    it(`returns nothing`, () => {
      const data = [
        [0],
        [0],
        [1],
        [1],
        [2],
        [2],
      ]
      expect(ray.vertical(data)).to.deep.eq([])
    })

    it(`returns two arrays in separate columns`, () => {
      const data = [
        [0, 1],
        [0, 1],
        [0, 1],
        [0, 1],
        [1, 2],
        [1, 2],
      ]
      const expected: Ray[] = [
        {
          type: ray.Type.Vertical,
          color: 0,
          length: 4,
          from: { i: 0, j: 0 },
          to: { i: 3, j: 0 },
        },
        {
          type: ray.Type.Vertical,
          color: 1,
          length: 4,
          from: { i: 0, j: 1 },
          to: { i: 3, j: 1 },
        },
      ]
      expect(ray.vertical(data)).to.deep.eq(expected)
    })

    it(`finds nothing in a stable example`, () => {
      expect(ray.vertical(stable)).to.deep.eq([])
    })

  })

  describe(`getCoords`, () => {

    it(`works for two non-insertecting rays`, () => {
      const rays: Ray[] = [
        {
          type: ray.Type.Horizontal,
          color: 0,
          length: 3,
          from: { i: 0, j: 0 },
          to: { i: 0, j: 2 },
        },
        {
          type: ray.Type.Vertical,
          color: 1,
          length: 3,
          from: { i: 1, j: 2 },
          to: { i: 3, j: 2 },
        },
      ]
      const expected: Coord[] = [
        { i: 0, j: 0 },
        { i: 0, j: 1 },
        { i: 0, j: 2 },
        { i: 1, j: 2 },
        { i: 2, j: 2 },
        { i: 3, j: 2 },
      ]
      expect(ray.getCoords(rays)).to.deep.eq(expected)
    })

    it(`does not duplicate a coord when there's an intersection`, () => {
      const rays: Ray[] = [
        {
          type: ray.Type.Horizontal,
          color: 0,
          length: 3,
          from: { i: 0, j: 0 },
          to: { i: 0, j: 2 },
        },
        {
          type: ray.Type.Vertical,
          color: 0,
          length: 3,
          from: { i: 0, j: 2 },
          to: { i: 2, j: 2 },
        },
      ]
      const expected: Coord[] = [
        { i: 0, j: 0 },
        { i: 0, j: 1 },
        { i: 0, j: 2 },
        { i: 1, j: 2 },
        { i: 2, j: 2 },
      ]
      expect(ray.getCoords(rays)).to.deep.eq(expected)
    })

  })

})
