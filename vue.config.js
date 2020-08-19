module.exports = {
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
