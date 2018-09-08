import * as utils from './utils'
import Coord, * as coord from './coord'
import { Board } from './index'

export interface ItemInfo {
  coord: Coord
  by: number
}

export interface AddedItem {
  coord: Coord
  color: number
}

export interface Info {
  existing: ItemInfo[]
  added: AddedItem[]
  columnMissingCounts: number[]
}

/**
 * Mutate the board and return precise information about how
 * the items should fall down when a set of coordinates
 * is purged it.
 * 
 * @param board State of the board.
 * @param coords The coordinates to remove.
 */
export default function gravity (board: Board, coords: Coord[]): Info {

  // purge the elements which should disappear
  for (const { i, j } of coords) {
    board.data[i][j] = -1
  }

  const existing: ItemInfo[] = []
  const added: AddedItem[] = []
  const columnMissingCounts = Array.from<number>({length: board.data[0].length}).fill(0)

  // traverse matrix upwards from bottom (left or right is irrelevant)
  for (let col = 0; col < board.width; col++) {
    let emptyCount = 0
    for (let row = 0; row < board.height; row++) {
      const curr = board.data[row][col]
      if (curr == -1) {
        emptyCount++
        continue
      }
      if (emptyCount > 0) {
        existing.push({
          coord: { i: row, j: col },
          by: emptyCount,
        })
      }
    }
    columnMissingCounts[col] = emptyCount
  }

  // drop elements upwards
  for (const { coord: {i, j}, by } of existing) {
    board.data[i - by][j] = board.data[i][j]
  }

  // place new stuff in blanks
  for (let col = 0; col < columnMissingCounts.length; col++) {
    for (let row = 0; row < columnMissingCounts[col]; row++) {
      const color = board.prng.next().value
      const i = board.height - 1 - row
      const j = col
      board.data[i][j] = color
      added.push({
        color,
        coord: { i, j },
      })
    }
  }

  return {
    existing,
    added,
    columnMissingCounts,
  }

}