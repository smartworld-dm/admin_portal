require('../server.babel'); // babel registration (runtime transpilation for node)

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const precss = require('precss');
const autoprefixer = require('autoprefixer');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  context: path.join(__dirname, '..', 'src'),

  entry: {
    app: [
      './index'
    ]
  },

  output: {
    path: path.join(__dirname, '..', 'public', 'build'),
    publicPath: '/build/',
    filename: '[name].js',
    chunkFilename: '[name].js'
  },

  resolve: {
    extensions: [ '.js', '.jsx'],
    modules: [
      'node_modules'
    ]
  },

  module: {
    rules: [
      {
				test: /\.jsx?$/, exclude: /\/node_modules\//,
				// loader: 'babel-loader'
				use: [
					"babel-loader"
				]
			},
      {
				test: /\.css$/,
				// loader: 'style!css!postcss'
				use: [
					"style-loader",
					"css-loader",
					// "postcss-loader"
				]
			},
      {
        test: /.(png|jpg|gif|woff(2)?|eot|ttf|svg)(\?[a-z0-9=\.]+)?$/,
        include: /\/node_modules\//,
        // loader: 'file?name=[1].[ext]?hash=[hash:6]&regExp=node_modules/(.*)',
				use : [{
					loader: "file-loader",
					options : {}
				}]
      }
    ]
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/), // include only ru|en locales in moment
    new webpack.IgnorePlugin(/moment\/min\/locales/),
    new ExtractTextPlugin('[name].css', { allChunks: true }),
    new webpack.DefinePlugin({
      'process.env': {
        __CLIENT__: JSON.stringify(true),
        __DEVTOOLS__: JSON.stringify(false),
        NODE_ENV: JSON.stringify('production'),
				HTTP_PROTOCOL: JSON.stringify(process.env.HTTP_PROTOCOL),
        API_HOST: JSON.stringify(process.env.API_HOST),
        YELP_HOST: JSON.stringify(process.env.YELP_HOST),
        EVENTBRITE_API_HOST: JSON.stringify(process.env.EVENTBRITE_API_HOST),
        EVENTBRITE_TOKEN: JSON.stringify(process.env.EVENTBRITE_TOKEN),
        UPLOAD_HOST: JSON.stringify(process.env.UPLOAD_HOST),
        PARSE_APPLICATION_ID: JSON.stringify(process.env.PARSE_APPLICATION_ID),
        PARSE_MASTER_KEY: JSON.stringify(process.env.PARSE_MASTER_KEY),
        GOOGLE_MAP_API_KEY: JSON.stringify(process.env.GOOGLE_MAP_API_KEY),
        FACEBOOK_APP_ID: JSON.stringify(process.env.FACEBOOK_APP_ID)
      }
    }),
    // new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: false,
        unsafe: false
        // screw_ie8: true
      }
    })
  ],

  // postcss: function () {
  //   return [precss, autoprefixer];
  // }
};
