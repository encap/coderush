const path = require('path');
const PrerenderSPAPlugin = require('prerender-spa-plugin');

// const fs = require('fs');
// const StatsPlugin = require('stats-webpack-plugin');
const plugins = [
  // new StatsPlugin('stats.json')
];
if (process.env.VUE_APP_API_URL === 'https://api.coderush.xyz') {
  plugins.push(new PrerenderSPAPlugin({
    staticDir: path.join(__dirname, 'dist'),
    routes: ['/', '/about', '/contribute'],
  }));
}

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
  },
  configureWebpack: {
    resolve: {
      alias: {
        // bundle size optimatization
        moment: 'moment/src/moment',
        'chart.js$': 'chart.js/dist/Chart.min.js',
      },
    },
    plugins,
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
    clientLogLevel: 'info',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    // https: {
    //   key: fs.readFileSync(`${process.env.HOME}/localhost.key`),
    //   cert: fs.readFileSync(`${process.env.HOME}/localhost.crt`),
    //   ca: fs.readFileSync(`${process.env.HOME}/rootCA.crt`),
    // },
  },
};
