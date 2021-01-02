import Vue from 'vue';
import VueSocketIOExt from 'vue-socket.io-extended';
import io from 'socket.io-client';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

// import only used icons to reduce bundle size
import {
  faUsers, faPlay, faHome, faInfo, faFileCode, faShareAlt, faTimes, faLink, faHeart, faServer, faUser, faSignOutAlt, faCopy, faUserCog, faCheck, faHourglassEnd, faSignal, faSlash, faCompressAlt, faExpandAlt,
} from '@fortawesome/free-solid-svg-icons';

import {
  faFacebookF, faFacebookMessenger, faTwitter,
} from '@fortawesome/free-brands-svg-icons';

import App from './App.vue';
import router from './router';
import store from './store';

library.add(faUsers, faPlay, faHome, faInfo, faFileCode, faShareAlt, faTimes, faLink, faFacebookF, faFacebookMessenger, faTwitter, faHeart, faServer, faUser, faSignOutAlt, faCopy, faUserCog, faCheck, faHourglassEnd, faSignal, faSlash, faCompressAlt, faExpandAlt);

Vue.component('fa', FontAwesomeIcon);
Vue.component('faStack', FontAwesomeLayers);

const socket = io(process.env.VUE_APP_API_URL, {
  autoConnect: false,
  reconnectionAttempts: 3,
  timeout: 10000,
});
Vue.use(VueSocketIOExt, socket, { store });

Vue.config.productionTip = false;

window.App = new Vue({
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

