import * as maths from './maths'
import * as dom from './dom'

interface Coord {
  x: number
  y: number
}

/**
 * Calculate the circumradius of a polygon with the given number of sides,
 * such that its area is equal to the area of a circle with the given radius.
 * 
 * @param polygonSideCount How many sides does the polygon have? (3 for triangle, 4 for square)
 * @param circleRadius What's the radius of the referent circle?
 */
function polygonCircumradius (polygonSideCount: number, circleRadius: number): number {
  const n = polygonSideCount
  const R = circleRadius
  const { PI, sin, sqrt } = Math

  const den = 2 * R ** 2 * PI
  const num = n * sin(2 * PI / n)
  return sqrt(den / num)
}

function polygonVertexCoords (
  polygonSideCount: number,
  circumradius: number,
  offset: number): Coord[] {

  return maths.getNotches(polygonSideCount, 2 * Math.PI)
    .map(angle => angle + offset)
    .map(angle => ({
      x: circumradius * Math.sin(angle),
      y: circumradius * Math.cos(angle),
    }))

}

function printCoords (coords: Coord[]): string {
  return coords.map(({x, y}) => `${x},${y}`).join(' ')
}

export function generateSvg (
  circleRadius: number,
  parent: HTMLElement = document.body): void {

  const svgEl = dom.hSvg('svg')
  svgEl.setAttribute('hidden', '')
  svgEl.id = 'definitions'

  const defsEl = dom.hSvg('defs')

  // circle is a special case
  {
    const gEl = dom.hSvg('g')
    gEl.id = 'shape-0'
    const circleEl = dom.hSvg('circle')
    circleEl.setAttribute('cx', '0')
    circleEl.setAttribute('xy', '0')
    circleEl.setAttribute('r', circleRadius.toString())
    gEl.appendChild(circleEl)
    defsEl.appendChild(gEl)
  }

  for (let i = 0; i < 6; i++) {
    const n = 4 + 2 * Math.floor(i / 2)
    const phi = 2 * Math.PI / n
    const isSecndOfPair = i % 2 == 1

    const gEl = dom.hSvg('g')
    gEl.id = `shape-${i + 1}`

    const poly = dom.hSvg('polygon')
    const R = polygonCircumradius(n, circleRadius)
    const coords = polygonVertexCoords(n, R, Math.PI / 2 + (isSecndOfPair ? phi / 2 : 0))

    poly.setAttribute('points', printCoords(coords))
    gEl.appendChild(poly)
    defsEl.appendChild(gEl)
  }

  svgEl.appendChild(defsEl)
  parent.insertBefore(svgEl, parent.firstChild)
  
}
