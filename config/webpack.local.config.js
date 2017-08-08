const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseDir = process.cwd();

module.exports = {
  devtool : ['source-map', 'css-loader?sourceMap'],
  plugins : [
    new HtmlWebpackPlugin({
      template : baseDir + '/src/www/index.template.ejs',
      inject   : 'body',
      GTM      : 'GTM-N6WPMQ'
    })
  ]
};
