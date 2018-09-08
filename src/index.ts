import * as utils from './utils'
import Coord, * as coord from './coord';

export interface Config {
  width: number
  height: number
  colorsCount: number
  prng: Iterator<number>
}

export function isIn (board: Board, { i, j }: Coord): boolean {
  const left = i >= 0
  const right =  i <= board.width - 1
  const bottom = j >= 0
  const top = j <= board.height - 1
  return left && right && bottom && top
}

export function dataUnsafe (board: Board, coord: Coord | null): number | null {
  if (coord == null) return null
  return board.data[coord.i][coord.j] || null
}

export function data (board: Board, { i, j }: Coord): number {
  if (isIn(board, { i, j })) return board.data[i][j]
  throw new Error(`Coordinate (${i}, ${j}) not in the board.`)
}

export interface Board extends Config {
  data: number[][]
}

export function validateConfig (config: Config): Config {
  const errors: string[] = []
  utils.assert(config.width, w => w >= 6, `Width has to be >= 6.`, errors)
  utils.assert(config.height, h => h >= 6, `Height has to be >= 6.`, errors)
  utils.assert(config.colorsCount, c => c >= 5, `Colors count has to be >= 5.`, errors)
  if (errors.length > 0) {
    throw new Error(`Config is invalid.\n` + errors.map(message => `  ${message}`).join('\n'))
  }
  return config
}

export function create (config: Config): Board {
  const data: number[][] = []

  for (let i = 0; i < config.height; i++) {
    data[i] = new Array(config.width)

    for (let j = 0; j < config.width; j++) {
      
      // Some diamonds might be forbidden here because there's
      // a chance that we accidently create three in a row.
      //
      // a a x
      //   b c d
      // b   c   d
      //
      // This is also the reason why at least 5 different diamonds
      // are needed. With less, it's becoming much more complex
      // to avoid this situation.
      const forbidden: number[] = []

      // From the left (a)
      if (j >= 2) {
        const [one, two] = [data[i][j - 1], data[i][j - 2]]
        if (one == two) forbidden.push(one)
      }

      // From the left-bottom (b)
      if (j >= 2 && i >= 2) {
        const [one, two] = [data[i - 1][j - 1], data[i - 2][j - 2]]
        if (one == two) forbidden.push(one)
      }

      // From the bottom (c)
      if (i >= 2) {
        const [one, two] = [data[i - 1][j], data[i - 2][j]]
        if (one == two) forbidden.push(one)
      }

      // From the bottom-right (d)
      if (config.width - j > 2 && i >= 2) {
        const [one, two] = [data[i - 1][j + 1], data[i - 2][j + 2]]
        if (one == two) forbidden.push(one)
      }

      // Now we can repeatedly generate a new random diamond until we
      // get the on we're OK with.
      data[i][j] = utils.repeatWhile(
        () => {
          const n = config.prng.next().value
          return n
        },
        n => forbidden.includes(n),
      )

    }

  }

  return {
    ...config,
    data,
  }
}

export function isLegalSwap (board: Board, src: Coord, dst: Coord): boolean {
  const isSrcOk = isIn(board, src)
  const isDstOk = isIn(board, dst)
  const { width, height } = board
  if (!isSrcOk || !isDstOk) return false
  return (
    coord.eq(coord.left(width, height, src), dst) ||
    coord.eq(coord.left(width, height, dst), src) ||
    coord.eq(coord.right(width, height, src), dst) ||
    coord.eq(coord.right(width, height, dst), src) ||
    coord.eq(coord.top(width, height, src), dst) ||
    coord.eq(coord.top(width, height, dst), src) ||
    coord.eq(coord.bottom(width, height, src), dst) ||
    coord.eq(coord.bottom(width, height, dst), src)
  )
}

export function swap (board: Board, first: Coord, second: Coord): void {
  if (!isLegalSwap(board, first, second)) throw new Error(`Illegal swap.`)
  const [a, b, x, y] = [first.i, first.j, second.i, second.j]
  const temp = board.data[a][b]
  board.data[a][b] = board.data[x][y]
  board.data[x][y] = temp
}



export function print (board: Board): string {
  return board.data.map(row => {
    return row.join('')
  }).join('\n')
}
