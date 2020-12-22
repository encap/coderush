const path = require('path');
const PrerenderSPAPlugin = require('prerender-spa-plugin');

// const zopfli = require('@gfx/zopfli');

// const fs = require('fs');
// const StatsPlugin = require('stats-webpack-plugin');


module.exports = {
  productionSourceMap: false,
  css: {
    loaderOptions: {
      sass: {
        prependData: '\n@import "@/styles/global.sass"\n',
        sassOptions: {
          indentedSyntax: true,
        },
      },
    },
    sourceMap: false,
    // extract: {
    //   filename: 'css/[name].css',
    //   chunkFilename: 'css/[name].css',
    // },
  },
  pluginOptions: {
    // compression: {
    //   zopfli: {
    //     filename: '[path]',
    //     include: /\.js$|\.css$/,
    //     exclude: /cm\/|code\//,
    //     compressionOptions: {
    //       numiterations: 15,
    //     },
    //     algorithm(input, compressionOptions, callback) {
    //       return zopfli.gzip(input, compressionOptions, callback);
    //     },
    //   },
    // },
  },
  configureWebpack: {
    // output: {
    //   filename: 'js/[name].js',
    //   chunkFilename: 'js/[name].js',
    // },
    resolve: {
      alias: {
        // bundle size optimatization
        moment: 'moment/src/moment',
        'chart.js$': 'chart.js/dist/Chart.min.js',
      },
    },
    plugins: [
      // new StatsPlugin('stats.json'),
      new PrerenderSPAPlugin({
        // Required - The path to the webpack-outputted app to prerender.
        staticDir: path.join(__dirname, 'dist'),
        // Required - Routes to render.
        routes: ['/', '/about', '/contribute'],
      }),
    ],
  },
  chainWebpack(config) {
    config.optimization.minimizer('terser').tap((args) => {
      const { terserOptions } = args[0];
      terserOptions.compress.drop_console = true;
      return args;
    });

    config.plugin('copy').tap((options) => {
      options[0][0].ignore.push('**/material-darker.css');
      return options;
    });


    // config.plugins.delete('prefetch');
  },
  devServer: {
    progress: true,
    clientLogLevel: 'info',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    // before(app) {
    //   app.use((req, res, next) => {
    //     if (req.path.slice(0, 4) === '/cm/') {
    //       res.header('content-encoding', 'gzip');
    //     }
    //     next();
    //   });
    // },

    // compress: false,
    // https: {
    //   key: fs.readFileSync(`${process.env.HOME}/localhost.key`),
    //   cert: fs.readFileSync(`${process.env.HOME}/localhost.crt`),
    //   ca: fs.readFileSync(`${process.env.HOME}/rootCA.crt`),
    // },
  },
};
