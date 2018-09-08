export const $ = (selector: string) => document.querySelector(selector) as HTMLElement
export const $$ = (selector: string) => document.querySelectorAll(selector)
export const h = <K extends keyof HTMLElementTagNameMap>(name: K) => document.createElement(name)
export const hSvg = <K extends keyof SVGElementTagNameMap>(name: K) => document.createElementNS('http://www.w3.org/2000/svg', name) as SVGElementTagNameMap[K]
