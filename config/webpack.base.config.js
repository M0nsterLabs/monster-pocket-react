var path = require('path');
var TransferWebpackPlugin = require('transfer-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
var baseDir = process.cwd();
var nodeModulesPath = path.resolve(baseDir, 'node_modules');

module.exports = {
  node: {fs: "empty"},
  entry     : {
    MascotAndSocialProof : './entry/MascotAndSocialProof.js',
    advice: './src/model/advice/Advice.js',
    index                : './entry/index.js'
  },
  externals : {
    'react'     : 'React',
    'react-dom' : 'ReactDOM'
  },
  module    : {
    preLoaders : [
      {
        test    : /\.js$/,
        loader  : 'eslint',
        include : [path.resolve(baseDir, './src')],
        exclude : [nodeModulesPath]
      }
    ],
    loaders    : [
      {
        test   : /\.css$/,
        loader : 'style-loader!css-loader'
      },
      {
        test   : /\.less$/,
        loader : 'style-loader!css-loader!less-loader'
      },
      {
        test    : /\.jsx?$/,
        loader  : 'babel',
        exclude : nodeModulesPath,
        query   : {presets : ['es2015', 'react', 'stage-0']}
      },
      {
        test    : /\.js?$/,
        loader  : 'babel',
        exclude : nodeModulesPath,
        query   : {presets : ['es2015', 'react', 'stage-0']}
      },
      {
        test    : /\.(png|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loaders : ['file']
      }
    ]
  },
  postcss   : function() {
    return [
      require('postcss-inline-svg'),
      require('autoprefixer')
    ];
  },
  eslint    : {
    configFile : '.eslintrc'
  },
  plugins   : [
    new TransferWebpackPlugin(
      [
        {from : 'www'}
      ],
      path.resolve(baseDir, 'src')
    )
  ],
  resolve   : {
    extensions : ['', '.js', '.jsx']
  }
};
