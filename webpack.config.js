const merge = require('webpack-merge');

const env = process.env.NODE_ENV || 'local';

module.exports = merge(
  require('./config/webpack.base.config.js'),
  require(`./config/webpack.${env}.config.js`)
);
