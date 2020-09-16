import Vue from 'vue';
import VueSocketIOExt from 'vue-socket.io-extended';
import io from 'socket.io-client';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import {
  faUsers, faPlay, faGlobeAmericas, faGlobeEurope, faInfo, faUser, faSignOutAlt, faCopy, faShareAlt,
} from '@fortawesome/free-solid-svg-icons';
// import { fab } from '@fortawesome/free-brands-svg-icons';
// import { far } from '@fortawesome/free-regular-svg-icons';
import App from './App.vue';
import router from './router';
import store from './store';
// import trackMouse from './trackMouse';

// Vue.mixin(trackMouse);

const socket = io('/', {
  autoConnect: false,
  reconnectionAttempts: 3,
  timeout: 10000,
});

library.add(faUsers, faPlay, faGlobeAmericas, faGlobeEurope, faInfo, faUser, faSignOutAlt, faCopy, faShareAlt);

Vue.use(VueSocketIOExt, socket, { store });
Vue.component('fa', FontAwesomeIcon);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render(h) { return h(App); },
}).$mount('#app');

window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'webpackInvalid') {
    console.clear();
  }
});

console.red = (msg) => {
  console.log(`%c${msg}`, 'color: #f44336');
};
console.green = (msg) => {
  console.log(`%c${msg}`, 'color: #00dd00');
};
console.blue = (msg) => {
  console.log(`%c${msg}`, 'color: #00cdff');
};

