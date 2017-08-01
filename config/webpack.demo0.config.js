const Webpack = require('webpack');

module.exports = {
  devtool : ['source-map'],
  plugins : [
    new Webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('demo0')
      }
    })
  ]
};
