const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: {
    overlay: './src/overlay/main.ts',
    'virtual-scroll': './src/virtual-scroll/main.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'docs')
  },
  plugins: [
    new CopyWebpackPlugin([{from: 'src/overlay/index.html', to:'overlay.html', toType: 'file'}]),
    new CopyWebpackPlugin([{from: 'src/virtual-scroll/index.html', to:'virtual-scroll.html', toType: 'file'}]),
    new CopyWebpackPlugin([{from: 'src/index.html', to:'index.html', toType: 'file'}]),
    new CopyWebpackPlugin([{from: 'data', to:'data', toType: 'dir'}]),
    new CleanWebpackPlugin(['docs']), // cleanup the dist directory before build
  ],
  devtool: "inline-source-maps",
  devServer: {
    contentBase: '.',
    openPage: 'index.html'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [/node_modules/, /docs/]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
}