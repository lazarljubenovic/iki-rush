import * as animationQueue from '../animation-queue'
import Coord, * as coord from '../coord'
import { $, $$ } from '../dom'
import * as gravity from '../gravity'
import { generateTile } from '../browser'

const duration = 100
const easing = 'linear'

export default function fall(gravityInfo: gravity.Info): animationQueue.Descriptor {

  const existing = gravityInfo.existing.map(item => {
    const element = $(coord.selector(item.coord))
    const dst = $(coord.selector(coord.add(item.coord, { i: -item.by, j: 0 })))
    const animation = [
      { transform: 'translateY(0)' },
      { transform: `translateY(calc(${item.by} * var(--size)))` }
    ]
    return {
      element,
      animation,
      options: {
        duration: item.by * duration,
        easing,
      },
      after: () => {
        dst.appendChild(element.firstChild!)
      }
    }
  })

  const added = gravityInfo.added.map(item => {
    const by = gravityInfo.columnMissingCounts[item.coord.j]
    const offset = { i: by, j: 0 }
    const element = $(coord.selector(coord.add(item.coord, offset)))
    const transform = `translateY(calc(${by} * var(--size)))`
    const dst = $(coord.selector(item.coord))
    const animation = [
      { transform: 'translateY(0)', opacity: 0 },
      { opacity: 1, offset: 1 / by },
      { transform: transform },
    ]
    return {
      element,
      animation,
      options: {
        duration: by * duration,
        easing,
      },
      after: () => {
        dst.appendChild(element.firstChild!)
      }
    }
  })

  return {
    group: [...existing, ...added],
    cooldown: 100,
    before: () => {
      gravityInfo.added.forEach(item => {
        const offsetI = gravityInfo.columnMissingCounts[item.coord.j]
        const offset = { i: offsetI, j: 0 }
        const fakeCoord = coord.add(item.coord, offset)
        const svg = generateTile(item.color)
        $(coord.selector(fakeCoord)).appendChild(svg)
      })
    },
  }

}
