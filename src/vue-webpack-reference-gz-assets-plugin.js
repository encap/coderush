/* eslint-disable class-methods-use-this */
class VueWebpackReferenceGzAssetsPlugin {
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('vue-loader-plugin', (compilation) => {
      const { hooks } = compilation;

      const beforeGenerationHook = hooks.htmlWebpackPluginAlterAssetTags;
      beforeGenerationHook.tapAsync('VueWebpackReferenceGzAssetsPlugin', (data, cb) => {
        const links = data.head;
        data.head = links.map((link) => { link.attributes.href += '.gz'; return link; });

        const scripts = data.body;
        data.body = scripts.map((script) => { script.attributes.src += '.gz'; return script; });

        return cb(null, data);
      });
    });
  }
}

module.exports = VueWebpackReferenceGzAssetsPlugin;
