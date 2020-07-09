const HtmlWebpackPlugin = require('html-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const path = require('path')
const { DefinePlugin } = require('webpack')

const ProdMode = process.env.NODE_ENV === 'production'

console.log(`production : ${ProdMode}`)

module.exports = {
  mode: 'development',

  entry: {
    main: path.resolve(__dirname, './src/app.ts')
  },
  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, './dist'),
    libraryTarget: 'umd'
  },

  // watch: true,
  // watchOptions: {
  //   poll: 1000,
  //   aggregateTimeout: 500,
  //   ignored: /node_modules/,
  // },
  resolve: {
    extensions: ['.ts', '.js', '.scss'],
    alias: {
      // '~': path.resolve(__dirname, 'src')
    }
  },
  optimization: {
    minimize: ProdMode,
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                declaration: false
              }
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  devtool: ProdMode ? false : 'inline-source-map',
  // devtool: false,
  devServer: {
    contentBase: './dist',
    open: true,
    stats: 'errors-only',
    compress: true,
    host: 'localhost',
    watchOptions: {
      ignored: /__tests__/
    }
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: ['./dist']
    }),
    new HtmlWebpackPlugin({
      template: './public/index.ejs',
      inject: true,
      favicon: './public/favicon.ico',
      minify: {
        collapseWhitespace: ProdMode,
        removeComments: true
      },
      hash: true,
      templateParameters: {
        env: JSON.stringify(process.env),
      }
    }),
    new ScriptExtHtmlWebpackPlugin({}),
    new DefinePlugin({
      'process.env': {
        BASE_URL: '""'
      }
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'public'),
          to: path.resolve(__dirname, 'dist'),
          toType: 'dir',
          globOptions: {
            ignore: ['index.ejs']
          }
        }
      ]
    })
  ]
}
