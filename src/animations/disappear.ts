import * as animationQueue from '../animation-queue'
import Coord, * as coord from '../coord'
import { $ } from '../dom'

function disappearOne (aCoord: Coord) {

  const element = () => $(coord.selector(aCoord))!

  const animation: any[] = [
    { transform: 'scale(1)', opacity: 1 },
    { transform: 'scale(.5)', opacity: 0 },
  ]

  const options: KeyframeAnimationOptions = {
    duration: 120,
    easing: 'cubic-bezier(.54,-0.34,.94,.44)',
  }

  return {
    element,
    animation,
    options,
  }

}

export default function disappear (coords: Coord[]): animationQueue.Descriptor {

  const group = coords.map(disappearOne)

  return {
    group,
    after: () => {
      group.forEach(item => {
        const el = item.element()!
        el.removeChild(el.firstChild!)
      })
    }
  }

}
