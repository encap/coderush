const assetsPath = process.env.VUE_APP_ASSETS_PATH || '';
const zopfli = require('@gfx/zopfli');

const VueWebpackReferenceGzAssetsPlugin = require('./vue-webpack-reference-gz-assets-plugin.js');

module.exports = {
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
        include: /\.js$|\.css$/,
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
    plugins: [
      // zofil compression
      // new CompressionPlugin({
      //   compressionOptions: {
      //     numiterations: 15,
      //   },
      //   algorithm(input, compressionOptions, callback) {
      //     return zopfli.gzip(input, compressionOptions, callback);
      //   },
      //   test: /\.js$|\.css$/,
      // }),
      // new HtmlWebpackChangeAssetsExtensionPlugin(),
      new VueWebpackReferenceGzAssetsPlugin(),
    ],
  },
  chainWebpack(config) {
    config.plugins.delete('prefetch');
  },
  devServer: {
    proxy: 'http://127.0.0.1:3000',
  },

};
