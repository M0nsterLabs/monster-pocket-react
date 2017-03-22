const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const baseDir = process.cwd();
const buildPath = path.resolve(baseDir, 'build');

module.exports = {

  output: {
    path     : buildPath,
    filename : '../build/[name].js',
    library  : ['[name]']
  },
  devServer: {
    contentBase        : '../src/www',
    host               : '0.0.0.0',
    port               : 8001,
    historyApiFallback : true,
    inline             : true,
    hot                : false,
    https              : true
  },
  devtool : ['source-map', 'css-loader?sourceMap'],
  plugins : [
    new HtmlWebpackPlugin({
      template : baseDir + '/src/www/index.template.ejs',
      inject   : 'body',
      GTM      : 'GTM-N6WPMQ'
    })
  ]
};
