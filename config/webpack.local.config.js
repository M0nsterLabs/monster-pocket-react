var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var baseDir = process.cwd();
var buildPath = path.resolve(baseDir, 'build');
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
    https              : false
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
