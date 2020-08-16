import Vue from 'vue';
import VueSocketIOExt from 'vue-socket.io-extended';
import io from 'socket.io-client';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import App from './App.vue';
import router from './router';
import store from './store';
// import trackMouse from './trackMouse';

// Vue.mixin(trackMouse);

const socket = io(process.env.VUE_APP_URL, {
  autoConnect: false,
  reconnectionAttempts: 3,
  timeout: 10000,
});

library.add(fas, far, fab);

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

console.blue = (msg) => {
  console.log(`%c${msg}`, 'color: #00cdff');
};
console.green = (msg) => {
  console.log(`%c${msg}`, 'color: #00dd00');
};
