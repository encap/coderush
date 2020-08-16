import axios from 'axios';
import Vue from 'vue';

const state = {
  languagesList: [],
  customCode: {
    text: '',
    tabSize: 0,
    lines: 0,
    showEditor: false,
  },
  codeInfo: {},
  trackedContainers: [],
};

const getters = {
  languagesList: (state) => state.languagesList,
  customCode: (state) => state.customCode,
  codeInfo: (state) => state.codeInfo,
  trackedContainers: (state) => state.trackedContainers,
};

const actions = {
  loadLanguagesList: async (context) => {
    if (!context.state.languagesList.length) {
      try {
        const response = await axios.get('/list.json');
        const languagesList = response.data.map((language, index) => ({ ...language, index }));
        context.commit('SET_LANGUAGES_LIST', languagesList);
      } catch (err) {
        console.warn('LANGUAGE LIST ERROR', err);
      }
    }
  },
  deleteCustomCode: (context) => {
    context.commit('SET_CUSTOM_CODE', {
      text: '', tabSize: 0, lines: 0, showEditor: false,
    });
  },
  generateCodeInfo: ({ state, rootState, commit }, fileIndex) => {
    let codeInfo = {};
    if (fileIndex === -1) {
      codeInfo.tabSize = state.customCode.lines;
      codeInfo.lines = state.customCode.lines;
    } else {
      console.log(rootState);
      codeInfo = rootState.options.language.files[fileIndex];
    }
    commit('SET_CODE_INFO', codeInfo);
  },
};

const mutations = {
  SET_LANGUAGES_LIST: (state, list) => {
    state.languagesList = list;
  },
  SET_CUSTOM_CODE: (state, code) => {
    state.customCode = code;
  },
  USE_CUSTOM_CODE: (state, message) => {
    console.log('use custom code');
    Vue.set(state.customCode, 'showEditor', message);
  },
  SET_CODE_INFO(state, codeInfo) {
    state.codeInfo = codeInfo;
  },
  ADD_TRACKED_CONTAINER(state, container) {
    state.trackedContainers.push(container);
  },
  REMOVE_TRACKED_CONTAINER(state, className) {
    const index = state.trackedContainers.findIndex((el) => el.className === className);
    if (index !== -1) {
      state.trackedContainers.splice(index, 1);
    }
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
