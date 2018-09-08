import * as game from './index'
import Coord, * as coord from './coord'
import { $, $$, h, hSvg } from './dom'
import * as shapes from './shapes'
import AnimationQueue from './animation-queue'
import * as animations from './animations'
import * as ray from './ray'
import gravity from './gravity'
import * as utils from './utils'

$$('noscript')!.forEach(el => el.remove())
shapes.generateSvg(30)

export function generateTile (color: number): SVGSVGElement {
  const tile = hSvg('svg')
  tile.setAttribute('viewBox', '-50 -50 100 100')
  const use = hSvg('use')
  const tileName = `shape-${color}`
  use.setAttribute('href', '#' + tileName)
  tile.appendChild(use)
  return tile
}

function generateBoard(anchor: Element, width: number, height: number): game.Board {
  const table = h('table')
  for (let i = 0; i < height; i++) {
    const tr = table.insertRow()
    for (let j = 0; j < width; j++) {
      tr.insertCell()
    }
  }

  const board = h('div')
  board.id = 'board'

  board.appendChild(table)
  anchor.appendChild(board)

  const aGame = game.create({
    colorsCount: 7,
    width,
    height,
    prng: {
      next: () => ({
        value: utils.denormalize(7, Math.random()),
        done: false,
      }),
    },
  })

  const fragment = document.createDocumentFragment()

  // generate the visible divs
  aGame.data.forEach((row, i) => {
    row.forEach((color, j) => {
      const wrapper = h('div')
      wrapper.dataset.i = i.toString()
      wrapper.dataset.j = j.toString()
      wrapper.appendChild(generateTile(color))
      fragment.appendChild(wrapper)
    })
  })

  // generate five more empty divs which will be
  // filled as needed during falling animation
  for (let i = HEIGHT; i < HEIGHT + 8; i++) {
    for (let j = 0; j < WIDTH; j++) {
      const wrapper = h('div')
      wrapper.dataset.i = i.toString()
      wrapper.dataset.j = j.toString()
      fragment.appendChild(wrapper)
    }
  }

  board.appendChild(fragment)

  return aGame
}

function getCoord(td: HTMLTableCellElement): Coord {
  const tr = td.parentElement as HTMLTableRowElement
  console.assert(tr instanceof HTMLTableRowElement, `Parent of <td> not a <tr>.`)
  const i = HEIGHT - 1 - tr.rowIndex
  const j = td.cellIndex
  return { i, j }
}

const WIDTH = 8
const HEIGHT = 8

const board = generateBoard($('#game')!, WIDTH, HEIGHT)

let DRAG_START: Coord | null = null
let DRAG_END: Coord | null = null

$('table')!.addEventListener('mousedown', e => {
  const td = e.target as HTMLTableCellElement
  if (!(td instanceof HTMLTableCellElement)) return
  DRAG_START = getCoord(td)
})

function handleEnd(e: Event) {
  const td = e.target as HTMLTableCellElement
  if (!(td instanceof HTMLTableCellElement)) return
  const aCoord = getCoord(td)
  DRAG_END = aCoord
}

// It can happen that the user drags to outside the browser's viewport.
// Then we never catch the mouse release, and the user can just click
// anywhere on the screen and it would register as mouse release.
// To avoid this, we need to reset dragging things when the mouse enters.
document.body.addEventListener('mouseenter', e => {
  DRAG_START = null
  DRAG_END = null
})

document.body.addEventListener('mouseup', e => {
  // If user does mouseup because the drag started inside the table,
  // only then we care for this event.
  // Without the condition it would catch all clicks in the UI around
  // the table.
  if (DRAG_START != null) {
    handleEnd(e)
    makeMove()
  }
})
$('table')!.addEventListener('mouseout', handleEnd)

const queue = new AnimationQueue()

function makeMove() {
  console.assert(DRAG_START != null && DRAG_END != null, `Unexpected state: \
DRAG_START = ${DRAG_START}, DRAG_END = ${DRAG_END}`)

  const dragStart = DRAG_START!
  const dragEnd = DRAG_END!
  DRAG_START = null
  DRAG_END = null

  const offset = {
    i: Math.sign(dragEnd.i - dragStart.i),
    j: Math.sign(dragEnd.j - dragStart.j),
  }

  // click and release on the same element
  if (offset.i == 0 && offset.j == 0) {
    return
  }

  // attempt to move diagonally
  if (offset.i != 0 && offset.j != 0) {
    return
  }

  // Phase: swapping

  const start = dragStart
  const end = coord.add(dragStart, offset)
  game.swap(board, start, end)

  queue.add(animations.swap(start, end))

  // Cycle of disappearing and falling down
  let limit = 3
  while (true) {
    if (limit-- < 0) throw new Error('infi loop')
    const rays = [
      ...ray.horizontal(board.data),
      ...ray.vertical(board.data),
    ]
    const rayCoords = ray.getCoords(rays)

    if (rayCoords.length == 0) {
      break
    }

    // Phase: Disappear

    queue.add(animations.disappear(rayCoords))

    // Phase: Fall down

    const gravityInfo = gravity(board, rayCoords)
    queue.add(animations.fall(gravityInfo))

  }

}
