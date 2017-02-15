var Webpack = require('webpack');
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
  plugins: [
    new Webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
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
