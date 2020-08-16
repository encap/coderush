// modified lazy loader for webpack

import * as CodeMirror from 'codemirror';
import 'codemirror/addon/mode/simple';
import 'codemirror/addon/mode/overlay';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/selection/active-line';

// make cm global so modes can properly register
window.CodeMirror = CodeMirror;

if (!CodeMirror.modeURL) CodeMirror.modeURL = 'cm/mode/%N/%N.js';

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
    if (!CodeMirror.modes.hasOwnProperty(deps[i])) {
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
  if (CodeMirror.modes.hasOwnProperty(mode)) {
    // console.log(`[requireMode] Skipping ${mode}`);
    return ensureDeps(mode, cont);
  }
  if (loading.hasOwnProperty(mode)) {
    // console.log(`[requireMode.loading] Skipping ${mode}`);
    return loading[mode].push(cont);
  }

  const script = document.createElement('script');
  script.onerror = () => reject(Error('No internet'));
  script.async = true;
  script.src = CodeMirror.modeURL.replace(/%N/g, mode);
  // console.log(`loading: ${script.src}`);
  const others = document.getElementsByTagName('script')[0];
  loading[mode] = [cont];

  // omg 12h of debugging
  const list = loading[mode];

  CodeMirror.on(script, 'load', () => {
    // console.log('load');
    ensureDeps(mode, () => {
      for (let i = 0; i < list.length; i += 1) {
        list[i]();
      }
    });
  });

  others.parentNode.insertBefore(script, others);
};

CodeMirror.autoLoadMode = (instance, mode) => new Promise((resolve, reject) => {
  if (CodeMirror.modes.hasOwnProperty(mode)) {
    // console.log(`[autoLoadMode] Skipping ${mode}`);
    resolve('SKIP');
  }

  CodeMirror.requireMode(mode, () => {
    // console.warn('requireMode CB');
    instance.setOption('mode', mode);
    resolve('CB');
  }, reject);
});

const loadMode = async (cm, mode) => {
  if (mode) {
    // console.log(`LOADING ${mode}`);
    loading = {};
    const resp = await CodeMirror.autoLoadMode(cm, mode);
    return resp;
  }
  // console.log('no mode to load');
  return 'no mode to load';
};

const loadTheme = (name = 'material-darker') => {
  const existing = document.getElementById(name);

  if (!existing) {
    const link = document.createElement('link');
    link.href = `/cm/theme/${name}.css`;
    link.rel = 'stylesheet';
    link.id = name;
    document.head.appendChild(link);
  } else {
    return 'skip';
  }
};

export { loadMode, loadTheme };
