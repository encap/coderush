import Vue from 'vue';
import Vuex from 'vuex';
import options from './modules/options';
import room from './modules/room';
import misc from './modules/misc';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    options,
    room,
    misc,
  },

});
