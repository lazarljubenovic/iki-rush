import Coord, * as coord from './coord';

export const enum Type {
  Horizontal = 1 << 0,
  Vertical = 1 << 1,
  // MainDiagonal = 1 << 2,
  // BackDiagonal = 1 << 3,
}

export default interface Ray {
  type: Type,
  color: number
  length: number
  from: Coord,
  to: Coord,
}

export function horizontal (data: number[][], min: number = 3): Ray[] {
  const rays : Ray[] = []
  for (let i = 0; i < data.length; i++) {
    let prev = data[i][0]
    let length = 1
    let startJ = 0
    for (let j = 1; j < data[i].length; j++) {
      const curr = data[i][j]
      if (prev == curr) {
        // keep the chain going
        length++
      } else {
        // if it's long enough to be called a ray, add it
        if (length >= min) {
          rays.push({
            type: Type.Horizontal,
            color: prev,
            length,
            from: { i, j: startJ },
            to: { i, j: j - 1 },
          })
        }
        // since we broke off the chain, we reset
        length = 1
        startJ = j
      }
      prev = curr
    }
    // after we're done, we need to check if we've exited
    // while detecting a ray, and add it if true
    if (length >= min) {
      rays.push({
        type: Type.Horizontal, 
        color: prev, 
        length,
        from: { i, j: startJ },
        to: { i, j: data[i].length - 1 }
      })
    }
  }
  return rays
}

export function vertical (data: number[][], min: number = 3): Ray[] {
  const rays: Ray[] = []
  for (let j = 0; j < data[0].length; j++) {
    let prev = data[0][j]
    let length = 1
    let startI = 0
    for (let i = 1; i < data.length; i++) {
      const curr = data[i][j]
      if (prev == curr) {
        length++
      } else {
        if (length >= min) {
          rays.push({
            type: Type.Vertical,
            color: prev,
            length,
            from: { i: startI, j },
            to: { i: i - 1, j },
          })
        }
        length = 1
        startI = i
      }
      prev = curr
    }
    if (length >= min) {
      rays.push({
        type: Type.Vertical,
        color: prev,
        length,
        from: { i: startI, j },
        to: { i: data.length - 1, j },
      })
    }
  }
  return rays
}

function getCoordHorizontal (ray: Ray): Coord[] {
  const coords: Coord[] = []
  const i = ray.from.i
  const minJ = Math.min(ray.from.j, ray.to.j)
  const maxJ = Math.max(ray.from.j, ray.to.j)
  for (let j = minJ; j <= maxJ; j++) {
    coords.push({ i, j })
  }
  return coords
}

function getCoordVertical (ray: Ray): Coord[] {
  const coords: Coord[] = []
  const j = ray.from.j
  const minI = Math.min(ray.from.i, ray.to.i)
  const maxI = Math.max(ray.from.i, ray.to.i)
  for (let i = minI; i <= maxI; i++) {
    coords.push({ i, j })
  }
  return coords
}

function getCoordsSingle (ray: Ray): Coord[] {
  if (ray.type == Type.Horizontal) {
    return getCoordHorizontal(ray)
  } else {
    return getCoordVertical(ray)
  }
}

export function getCoords (rays: Ray[]): Coord[] {
  const result: Coord[] = []
  for (const aRay of rays) {
    const coords = getCoordsSingle(aRay)
    for (const aCoord of coords) {
      if (result.find(existing => coord.eq(existing, aCoord)) == null) {
        result.push(aCoord)
      }
    }
  }
  return result
}
