'use strict'

const { build } = require('esbuild')
const { writeFile, readFile } = require('fs').promises
const { minify } = require('html-minifier-terser')
const { sassPlugin } = require('esbuild-sass-plugin')
const browserSync = require('browser-sync')
const port = process.env.PORT || 3333

const htmlOpts = {
  collapseWhitespace: true,
  keepClosingSlash: true,
  minifyCSS: true,
  removeComments: true,
  removeRedundantAttributes: true
}

const config = {
  entryPoints: ['./web/entry.js'],
  bundle: true,
  format: 'esm',
  minify: process.env.NODE_ENV === 'production',
  loader: {
    '.js': 'jsx',
    '.svg': 'text'
  },
  outfile: 'build/bundle.js',
  plugins: [sassPlugin({ type: ['css-text'] })],
  define: {
    'process.env.BENCHMARK_HOSTNAME': JSON.stringify(process.env.BENCHMARK_HOSTNAME) || '""'
  }
}

async function buildWeb () {
  if (process.env.NODE_ENV === 'development') {
    const bs = browserSync.create()
    bs.init({ proxy: `localhost:${port}` })

    config.sourcemap = 'inline'
    config.watch = {
      onRebuild (error) {
        if (error) console.error('watch build failed:', error)
        bs.reload()
      }
    }
  }

  await build(config)

  const htmlFile = await readFile('./web/index.html', 'utf8')
  await writeFile(
    'build/index.html',
    process.env.NODE_ENV === 'production' ? await minify(htmlFile, htmlOpts) : htmlFile
  )
}

buildWeb()
