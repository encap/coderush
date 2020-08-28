const ASSETS_PATH = process.env.ASSETS_PATH || '/';

module.exports = {
  publicPath: ASSETS_PATH,
  css: {
    loaderOptions: {
      sass: {
        prependData: '\n          @import "@/styles/global.sass"\n        ',
        sassOptions: {
          indentedSyntax: true,
        },
      },
    },
    sourceMap: true,
    extract: {
      filename: 'css/[name].css',
      chunkFilename: 'css/[name].css',
    },
  },
  configureWebpack: {
    output: {
      filename: 'js/[name].js',
      chunkFilename: 'js/[name].js',
    },
  },
  devServer: {
    proxy: 'http://127.0.0.1:3000',
  },

};
