export function getNotches (n: number, max: number = 1, min: number = 0) {
  return Array.from({length: n}).map((_, i) => min + ((max - min) / n) * i)
}
