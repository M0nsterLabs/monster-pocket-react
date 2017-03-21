const path = require('path');
const TransferWebpackPlugin = require('transfer-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const baseDir = process.cwd();
const nodeModulesPath = path.resolve(baseDir, 'node_modules');

module.exports = {
  node  : {fs: 'empty'},
  entry : {
    advice               : './src/model/advice/Advice.js',
    mascotAndSocialProof : './entry/MascotAndSocialProof.js',
    index                : './entry/index.js'
  },
  externals: {
    'react'     : 'React',
    'react-dom' : 'ReactDOM'
  },
  module: {
    preLoaders: [
      {
        test    : /\.js$/,
        loader  : 'eslint',
        include : [path.resolve(baseDir, './src')],
        exclude : [nodeModulesPath]
      }
    ],
    loaders: [
      {
        test   : /\.css$/,
        loader : ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader')
      },
      {
        test   : /\.less$/,
        loader : ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader!postcss-loader?parser=postcss-safe-parser')
      },
      {
        test   : /\.svg/,
        loader : 'url-loader'
      },
      {
        test    : /\.jsx?$/,
        loader  : 'babel',
        exclude : nodeModulesPath,
        query   : {presets: ['es2015', 'react', 'stage-0']}
      },
      {
        test    : /\.js?$/,
        loader  : 'babel',
        exclude : nodeModulesPath,
        query   : {presets: ['es2015', 'react', 'stage-0']}
      },
      {
        test    : /\.(png|ttf|eot|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loaders : ['file']
      }
    ]
  },
  postcss: function () {
    return [
      require('postcss-inline-svg'),
      require('autoprefixer')
    ];
  },
  eslint: {
    configFile: '.eslintrc'
  },
  plugins: [
    new TransferWebpackPlugin(
      [
        {from: 'www'}
      ],
      path.resolve(baseDir, 'src')
    ),
    new ExtractTextPlugin('main.css')
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};
