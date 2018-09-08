import * as utils from './utils'

export interface GroupItem {
  element: HTMLElement | (() => HTMLElement)
  animation: any[]
  after?: () => void
  options: KeyframeAnimationOptions
}

export interface Descriptor {
  group: GroupItem[]
  cooldown?: number,
  before?: () => void
  after?: () => void
}

export default class AnimationQueue {

  private queue: Array<Descriptor> = []

  private isInProgress: boolean = false

  private executeNext() {
    // conditions and lock
    if (this.isInProgress || this.isEmpty()) return
    this.isInProgress = true

    // grab the least recently added item
    const descriptor = this.queue.shift()!

    // before hook
    if (descriptor.before != null) descriptor.before()

    // find the max duration
    const descriptorWithMaxDuration = descriptor.group.reduce((max, animation) => {
      const maxDuration = utils.zeroIfNotNumber(max.options.duration)
      const currDuration = utils.zeroIfNotNumber(animation.options.duration)
      return currDuration > maxDuration ? animation : max
    })

    // initiate all animations from the group
    // and remember a reference to the animation
    // with the max duration
    let animationWithMaxDuration: Animation
    descriptor.group.forEach(item => {
      const element = utils.execute(item.element)
      const animation = element.animate(item.animation, item.options)
      if (item.after != null) {
        animation.addEventListener('finish', item.after)
      }
      if (item == descriptorWithMaxDuration) {
        animationWithMaxDuration = animation
      }
    })

    // we need the max duration in order to attach the hook
    // for running the next animation inside it.
    // this is also where we run the after-hook and unlock
    animationWithMaxDuration!.addEventListener('finish', () => {
      if (descriptor.after) descriptor.after()
      this.isInProgress = false
      setTimeout(() => {
        this.executeNext()
      }, descriptor.cooldown || 0)
    })
  }

  private isEmpty() {
    return this.queue.length == 0
  }

  public add(descriptor: Descriptor) {
    this.queue.push(descriptor)
    this.executeNext()
  }

}
