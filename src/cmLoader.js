// modified codemirror lazy loader for webpack
import CodeMirror from 'codemirror';

import codemirror from 'vue-codemirror/src/codemirror.vue';
import 'codemirror/addon/mode/simple';
import 'codemirror/addon/mode/overlay';
import 'codemirror/lib/codemirror.css';
import '../public/cm/theme/material-darker.css';
import 'codemirror/addon/selection/active-line';
import 'cm-show-invisibles/lib/show-invisibles';

// make cm global so modes can properly register
window.CodeMirror = CodeMirror;
let loading = {};

function splitCallback(cont, n) {
  let countDown = n;
  return () => {
    countDown -= 1;
    if (countDown === 0) {
      cont();
    }
  };
}

const ensureDeps = (mode, cont) => {
  const deps = CodeMirror.modes[mode].dependencies;
  if (!deps) return cont();
  const missing = [];
  for (let i = 0; i < deps.length; i += 1) {
    if (!Object.prototype.hasOwnProperty.call(CodeMirror.modes, deps[i])) {
      missing.push(deps[i]);
    } else {
      // console.log(`[ensureDeps ${mode}] Skipping ${deps[i]}`);
    }
  }
  if (!missing.length) {
    return cont();
  }
  const split = splitCallback(cont, missing.length);

  for (let i = 0; i < missing.length; i += 1) {
    CodeMirror.requireMode(missing[i], split);
  }
};

CodeMirror.requireMode = (mode, cont, reject) => {
  if (mode) {
    if (Object.prototype.hasOwnProperty.call(CodeMirror.modes, mode)) {
    // console.log(`[requireMode] Skipping ${mode}`);
      return ensureDeps(mode, cont);
    }
    if (Object.prototype.hasOwnProperty.call(loading, mode)) {
    // console.log(`[requireMode.loading] Skipping ${mode}`);
      return loading[mode].push(cont);
    }

    const script = document.createElement('script');
    script.onerror = () => reject(Error('No internet'));
    script.async = true;
    script.src = `${process.env.VUE_APP_ASSETS_PATH || ''}/cm/mode/${mode}/${mode}.js`;
    const others = document.getElementsByTagName('script')[0];
    loading[mode] = [cont];

    const list = loading[mode];

    CodeMirror.on(script, 'load', () => {
      ensureDeps(mode, () => {
        for (let i = 0; i < list.length; i += 1) {
          list[i]();
        }
      });
    });

    others.parentNode.insertBefore(script, others);
  } else {
    cont();
  }
};

CodeMirror.autoLoadMode = (instance, mode, mime) => new Promise((resolve, reject) => {
  if (Object.prototype.hasOwnProperty.call(CodeMirror, mode)) {
    // console.log(`[autoLoadMode] Skipping ${mode}`);
    resolve('SKIP');
  }

  CodeMirror.requireMode(mode, () => {
    // instance.setOption('mode', mode);
    console.log(mode, mime);
    instance.setOption('mode', mime || mode);
    resolve('CB');
  }, reject);
});

const loadMode = async (cm, mode, mime) => {
  // if (mode) { // logo has empty mode but has mime
  loading = {};
  const resp = await CodeMirror.autoLoadMode(cm, mode, mime);
  return resp;
  // }
  // return 'no mode to load';
};

const loadTheme = (name = 'material-darker') => {
  // material-darker is bundled with main css
  if (name && name !== 'material-darker') {
    const existing = document.getElementById(name);

    if (!existing) {
      const link = document.createElement('link');
      link.href = `${process.env.VUE_APP_ASSETS_PATH || ''}/cm/theme/${name}.css`;
      link.rel = 'stylesheet';
      link.id = name;
      document.head.appendChild(link);
    } else {
      return 'skip';
    }
  } else {
    return 'skip';
  }
};

export { loadMode, loadTheme };
export default codemirror;
