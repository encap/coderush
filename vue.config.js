const ASSETS_PATH = process.env.ASSETS_PATH || '/';

module.exports = {
  publicPath: ASSETS_PATH,
  assetsDir: './static',
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
  },
  devServer: {
    proxy: 'http://127.0.0.1:3000',
  },

};
