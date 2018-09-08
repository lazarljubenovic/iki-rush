import typescript from 'rollup-plugin-typescript'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

const plugins = [
  typescript({
    typescript: require('typescript'),
  }),
  nodeResolve(),
  commonjs(),
]

if (true) {
  plugins.push(
    terser({
      compress: {
        keep_fargs: false,
        keep_fnames: false,
        drop_console: true,
        ecma: 6,
        passes: 3,
        toplevel: true,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
      },
      mangle: {
        properties: {
          reserved: [
            ...require('terser/tools/domprops'),
            'i',
            'j',
          ],
        },
      },
    }),
  )
}

export default {
  input: 'src/browser.ts',
  output: {
    file: 'index.js',
    format: 'iife',
    name: 'ikiRush',
  },
  plugins,
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**',
  },
}
