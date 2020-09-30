const assetsPath = process.env.VUE_APP_ASSETS_PATH || '';
const zopfli = require('@gfx/zopfli');
const fs = require('fs');
// const StatsPlugin = require('stats-webpack-plugin');
// const VueWebpackReferenceGzAssetsPlugin = require('./src/vue-webpack-reference-gz-assets-plugin.js');

module.exports = {
  productionSourceMap: false,
  publicPath: assetsPath,
  css: {
    loaderOptions: {
      sass: {
        prependData: '\n@import "@/styles/global.sass"\n',
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
  pluginOptions: {
    compression: {
      zopfli: {
        deleteOriginalAssets: true,
        include: /\.js$|\.css$/,
        exclude: assetsPath ? /code\// : /.+/,
        compressionOptions: {
          numiterations: 15,
        },
        algorithm(input, compressionOptions, callback) {
          return zopfli.gzip(input, compressionOptions, callback);
        },
      },
    },
  },
  configureWebpack: {
    output: {
      filename: 'js/[name].js',
      chunkFilename: 'js/[name].js',
    },
    resolve: {
      alias: {
        // bundle size optimatization
        moment: 'moment/src/moment',
        'chart.js$': 'chart.js/dist/Chart.min.js',
      },
    },
    // plugins: [
    // new StatsPlugin('stats.json'),
    // ].concat((assetsPath ? new VueWebpackReferenceGzAssetsPlugin() : [])),
  },
  // chainWebpack(config) {
  //  config.plugins.delete('prefetch');
  // },
  devServer: {
    proxy: 'http://127.0.0.1:3000',
    // {
    //   '^/': {
    //     target: 'http://127.0.0.1:3000',
    //     changeOrgin: true,
    //     ws: true,
    //     secure: false,
    //     logLevel: 'debug',
    //   },
    // },
    progress: true,
    compress: false,
    // https: assetsPath ? false : {
    //   key: fs.readFileSync(`${process.env.HOME}/localhost.key`),
    //   cert: fs.readFileSync(`${process.env.HOME}/localhost.crt`),
    //   ca: fs.readFileSync(`${process.env.HOME}/rootCA.crt`),
    // },
  },

};
