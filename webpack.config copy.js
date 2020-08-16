const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue',
      },
      {
        test: /\.s[a|c]ss$/,
        loader: 'style!css!sass',
      },
    ],
  },
  vue: {
    loaders: {
      scss: 'style!css!sass',
    },
  },
  plugins: [
    // make sure to include the plugin!
    new VueLoaderPlugin(),
  ],
};
