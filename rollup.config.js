import path from 'path'
import typescript from '@wessberg/rollup-plugin-ts'
import cleanup from 'rollup-plugin-cleanup'
import json from '@rollup/plugin-json'

const resolve = (p) => path.resolve(__dirname, p)

export default {
  input: resolve('src/index.ts'),
  output: [
    {
      file: resolve('dist/index.esm.js'),
      format: 'es',
      name: 'gaws',
      extend: true
    }
  ],
  plugins: [
    cleanup({ extensions: ['ts', 'tsx', 'js', 'jsx'] }),
    typescript({ tsconfig: resolve('tsconfig.json') }),
    json()
  ]
}
