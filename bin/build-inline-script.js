import crypto from 'crypto'
import fs from 'fs'
import { promisify } from 'util'
import path from 'path'
import { rollup } from 'rollup'
import terser from '@rollup/plugin-terser'
import replace from '@rollup/plugin-replace'
import terserOptions from './terserOptions.js'
import { inlineThemeColors } from '../webpack/shared.config.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const writeFile = promisify(fs.writeFile)

export async function buildInlineScript () {
  const inlineScriptPath = path.join(__dirname, '../src/inline-script/inline-script.js')

  const bundle = await rollup({
    input: inlineScriptPath,
    plugins: [
      replace({
        values: {
          'process.browser': true,
          'process.env.THEME_COLORS': JSON.stringify(inlineThemeColors)
        },
        preventAssignment: true
      }),
      // TODO: can't disable terser at all, it causes the CSP checksum to stop working
      // because the HTML gets minified as some point so the checksums don't match.
      terser({ ...terserOptions, mangle: !process.env.DEBUG })
    ]
  })
  const { output } = await bundle.generate({
    format: 'iife',
    sourcemap: true
  })

  const { code, map } = output[0]

  const fullCode = `${code}//# sourceMappingURL=/inline-script.js.map`
  const checksum = crypto.createHash('sha256').update(fullCode, 'utf8').digest('base64')

  await writeFile(path.resolve(__dirname, '../src/inline-script/checksum.js'),
    `export default ${JSON.stringify(checksum)}`, 'utf8')
  await writeFile(path.resolve(__dirname, '../static/inline-script.js.map'),
    map.toString(), 'utf8')

  return '<script>' + fullCode + '</script>'
}
