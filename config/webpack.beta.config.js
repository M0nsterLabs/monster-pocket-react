const Webpack = require('webpack');

module.exports = {
  devtool : ['source-map'],
  plugins : [
    new Webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('beta')
      }
    }),
    new Webpack.optimize.UglifyJsPlugin({
      compress: {
        sequences    : true,
        dead_code    : true,
        conditionals : true,
        booleans     : true,
        unused       : true,
        if_return    : true,
        join_vars    : true,
        // drop_console: true
      },
      mangle: {
        except: ['$super', '$', 'exports', 'require']
      },
      output: {
        comments: false
      }
    })
  ]
};
