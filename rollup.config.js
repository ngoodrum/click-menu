import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import {
  version,
  author,
  license,
  main,
  module,
  browser,
  style
} from './package.json';

const name = 'ClickNav';
const isProduction = !process.env.ROLLUP_WATCH;
const sourcemap = !isProduction ? 'inline' : false;
const extensions = ['.js', '.jsx'];
const preamble = `/* ClickNav - v${version}
* Copyright (c) ${new Date().getFullYear()} ${author}. Licensed ${license} */`;

export default (async () => ({
  input: './src/index.js',
  output: [
    {
      file: main,
      format: 'cjs',
      sourcemap
    },
    {
      file: module,
      format: 'esm',
      sourcemap
    },
    {
      name,
      file: browser,
      format: 'umd',
      sourcemap
    }
  ],
  plugins: [
    // Allows node_modules resolution
    resolve({ extensions }),
    // Allow bundling cjs modules. Rollup doesn't understand cjs
    commonjs(),
    // Compile JavaScript files
    babel({
      babelrc: false,
      extensions,
      exclude: ['node_modules/**', '[/\/core-js\//]'],
      runtimeHelpers: true,
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            targets: {
              ie: 11
            },
            useBuiltIns: 'usage',
            corejs: 3
          }
        ]
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-optional-chaining'
      ]
    }),
    // Extract CSS and create separate file
    postcss({
      extract: style,
      minimize: true
    }),
    // Minify JS if production build
    isProduction &&
      terser({
        output: { preamble }
      }),
    // Dev server
    !isProduction &&
      serve({
        contentBase: ['test', 'dist'],
        open: true
      }),
    // Live reloading for dev server
    !isProduction && livereload()
  ]
}))();