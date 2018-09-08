import * as animationQueue from '../animation-queue'
import Coord, * as coord from '../coord'
import { $ } from '../dom'

function actuallySwap (left: HTMLElement, right: HTMLElement): void {
  right.appendChild(left.firstChild!)
  left.appendChild(right.firstChild!)
}

function swapHorizontal(left: Coord, right: Coord): animationQueue.Descriptor {

  // in case left is actually right and right is left
  if (left.j > right.j) return swapHorizontal(right, left)

  const getLeft = () => $(coord.selector(left))!
  const getRight = () => $(coord.selector(right))!

  const moveRight: any[] = [
    { transform: 'translateX(0)' },
    { transform: 'translateX(var(--size))' },
  ]

  const moveLeft: any[] = [
    { transform: 'translateX(0)' },
    { transform: 'translateX(calc((-1) * var(--size)))' },
  ]

  const options: KeyframeAnimationOptions = {
    duration: 200,
    easing: 'cubic-bezier(.35,-0.04,.72,1.19)',
  }

  return {
    group: [
      {
        element: getLeft,
        animation: moveRight,
        options,
      },
      {
        element: getRight,
        animation: moveLeft,
        options,
      }
    ],
    after: () => {
      const l = getLeft()
      const r = getRight()
      actuallySwap(l, r)
    },
  }

}

function swapVertical(top: Coord, bottom: Coord): animationQueue.Descriptor {

  // in case top is actually bottom and bottom is top
  if (bottom.i > top.i) return swapVertical(bottom, top)

  const getTop = () => $(coord.selector(top))!
  const getBottom = () => $(coord.selector(bottom))!

  const moveUp: any[] = [
    { transform: 'translateY(0)' },
    { transform: 'translateY(calc((-1) * var(--size)))' },
  ]

  const moveDown: any[] = [
    { transform: 'translateY(0)' },
    { transform: 'translateY(var(--size))' },
  ]

  const options: KeyframeAnimationOptions = {
    duration: 200,
    easing: 'cubic-bezier(.35,-0.04,.72,1.19)',
  }

  return {
    group: [
      {
        element: getTop,
        animation: moveDown,
        options,
      },
      {
        element: getBottom,
        animation: moveUp,
        options,
      },
    ],
    after: () => {
      const t = getTop()
      const b = getBottom()
      actuallySwap(t, b)
    }
  }

}

export default function swap(first: Coord, second: Coord): animationQueue.Descriptor {
  if (first.i == second.i) {
    return swapHorizontal(first, second)
  } else {
    return swapVertical(first, second)
  }
}
