const rules = require('./webpack.rules');

rules.push({
  test: /\.css$/i,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'postcss-loader' }],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
};
