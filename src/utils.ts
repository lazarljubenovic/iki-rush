export function assert<T> (value: T, condition: (t: T) => boolean, message: string, errors: string[]): void {
  if (!condition(value)) {
    errors.push(`${message} Given value is ${value}.`)
  }
}

export function fpeq (a: number, b: number) {
  return Math.abs(a - b) < 1e-6
}

/**
 * A floating-point operator ">".
 * 
 * @param a Left argument of the operation.
 * @param b Right argument of the operation.
 * 
 * @example
 * fpgt(4, 4.0000001) // False, treated as equal.
 * fpgt(4, 3.9999999) // False, treated as equal.
 */
export function fpgt (a: number, b: number) {
  return a > b && !fpeq(a, b)
}

/**
 * A float-point operator ">=".
 * 
 * @param a Left argument of the operation.
 * @param b Right argument of the operation.
 * 
 * @example
 * fpgt(4, 4.0000001) // True, but because it's treated as equal.
 * fpgt(4, 3.9999999) // True, treated as equal
 */
export function fpge (a: number, b: number) {
  return a > b || fpeq(a, b)
}

/**
 * Transforms a float [0, 1) into an integer [0, n - 1]
 * 
 * @param float The given "random" nubmer.
 * @param max The given maximum integer that's needed.
 * 
 * @example
 * denormalize(0.3, 2) // => 0
 * denormalize(0.6, 2) // => 1
 * 
 * @example
 * denormalize(0.0, 7) // => 0 (min)
 * denormalize(1.0, 7) // => 6 (max)
 * 
 * @example
 * denormalize(0.5, 2) // => 0 (left side on boundaries)
 */
export function denormalize (float: number, max: number): number {
  let count = 0
  let wave = 0
  const step = 1 / max
  while (true) {
    wave = wave + step
    if (fpge(wave, float)) break
    count++
  }
  return count
}

/**
 * Repeat a function `fn`. Keep running the function in circles
 * as long as its return value satisfies `condition`. When it
 * doesn't, return the result.
 * 
 * @param fn Function to keep repeating.
 * @param condition A condition when to stop.
 */
export function repeatWhile<T> (fn: () => T, condition: (t: T) => boolean): T {
  let result = fn()
  while (condition(result)) {
    result = fn()
  }
  return result
}

export function zeroMatrix (width: number, height = width): number[][] {
  return Array(height).fill(undefined).map(() => Array(width).fill(0))
}

export function zeroIfNotNumber (value: any): number {
  return typeof value == 'number' ? value : 0
}

export function execute<T> (value: T | (() => T)): T {
  return typeof value == 'function' ? value() : value
}

export function cloneMatrix<T> (original: T[][]): T[][] {
  return [...original.map(row => [...row])]
}

export function noop () { }
