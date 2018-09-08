export default interface Coord {
  i: number
  j: number
}

export function left (widt: number, height: number, { i, j }: Coord): Coord | null {
  if (i == 0) return null
  return { i: i - 1, j }
}

export function right (width: number, height: number, { i, j }: Coord): Coord | null {
  if (i == width - 1) return null
  return { i: i + 1, j }
}

export function bottom (width: number, height: number, { i, j }: Coord): Coord | null {
  if (j == 0) return null
  return { i, j: j - 1 }
}

export function top (width: number, height: number, { i, j }: Coord): Coord | null {
  if (j == height - 1) return null
  return { i, j: j + 1 }
}

export function eq (a: Coord | null, b: Coord | null): boolean {
  if (a == null || b == null) return false
  return a.i == b.i && a.j == b.j
}

export function add (a: Coord, b: Coord): Coord {
  return { i: a.i + b.i, j: a.j + b.j }
}

export function selector(coord: Coord): string {
  return `[data-i="${coord.i}"][data-j="${coord.j}"]`
}
