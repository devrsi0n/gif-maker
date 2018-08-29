'use strict';

const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const webpack = require('webpack');

const { dist } = require('./paths');
const { getEntry, outputNames } = require('./utils');
const {
  getImageLoader,
  getStyleLoaders,
  getFileLoader,
  rawLoader,
} = require('./loaders');
const getBabelOptions = require('./babel');
const { getPlugins } = require('./plugins');

module.exports = {
  entry: getEntry(true),
  mode: 'production',
  bail: true,
  devtool: process.env.DEBUG ? 'eval-source-map' : false,
  watch: true,
  watchOptions: {
    // aggregateTimeout: 600,
    ignored: /node_modules/,
  },
  output: {
    path: dist,
    ...outputNames,
    publicPath: '/',
    // Access this library by window[package.name]
    library: 'ononoki',
    libraryTarget: 'umd',
  },
  optimization: {
    minimizer: [new OptimizeCSSAssetsPlugin()],
    // Automatically split vendor and commons
    splitChunks: {
      chunks: 'all',
      name: 'vendors',
    },
  },
  module: {
    rules: [
      {
        oneOf: [
          getImageLoader(true),
          {
            test: /\.jsx?$/,
            sideEffects: false,
            exclude: [/[/\\\\]node_modules[/\\\\]/],
            use: [
              require.resolve('thread-loader'),
              {
                loader: require.resolve('babel-loader'),
                options: getBabelOptions(true),
              },
            ],
          },
          {
            test: /\.css$/,
            use: getStyleLoaders(true, { importLoaders: 1 }),
          },
          {
            test: /\.(scss|sass)$/,
            use: getStyleLoaders(true, { importLoaders: 2 }, 'sass-loader'),
          },
          rawLoader,
          getFileLoader(true),
        ],
      },
    ],
  },
  plugins: [
    ...getPlugins(true),
    process.env.ANALYZER ? new BundleAnalyzerPlugin() : undefined,
    new webpack.NormalModuleReplacementPlugin(
      /\/Video/,
      require.resolve('./empty.js')
    ),
  ].filter(Boolean),
};
