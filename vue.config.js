const zopfli = require('@gfx/zopfli');
const fs = require('fs');
// const StatsPlugin = require('stats-webpack-plugin');

const assetsPath = process.env.VUE_APP_ASSETS_PATH || '';
const gz = assetsPath ? '.gz' : '';

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
    // copy: {
    //   globOptions: {
    //     ignore: ['**/material-darker.css']
    //   }
    // },
    compression: {
      zopfli: {
        filename: '[path]',
        include: /\.js$|\.css$/,
        exclude: /cm\/|code\//,
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
      // new StatsPlugin('stats.json'),
    ]
  },
  chainWebpack(config) {
    config.plugin('copy').tap(options => {
      options[0][0].ignore.push('**/material-darker.css');
      return options;
    });

  //  config.plugins.delete('prefetch');
  },
  devServer: {
    proxy: {
      '(^/database.json$)|(^/socket\.io/)|(^/cm/)': {
        target: 'http://localhost:3000',
        changeOrgin: true,
        ws: true,
        secure: false,
        logLevel: 'debug',
      },
      
    },
    progress: true,
    compress: false,
    // https: assetsPath ? false : {
    //   key: fs.readFileSync(`${process.env.HOME}/localhost.key`),
    //   cert: fs.readFileSync(`${process.env.HOME}/localhost.crt`),
    //   ca: fs.readFileSync(`${process.env.HOME}/rootCA.crt`),
    // },
  },

};
