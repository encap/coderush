import axios from 'axios';
import Vue from 'vue';

const state = {
  languagesList: [],
  databaseStats: {},
  customCode: {
    text: '',
    tabSize: 0,
    lines: 0,
    showEditor: false,
  },
  codeInfo: {},
  trackedContainers: [],
  smallScreen: false,
};

const getters = {
  languagesList: (state) => state.languagesList,
  databaseStats: (state) => state.databaseStats,
  customCode: (state) => state.customCode,
  codeInfo: (state) => state.codeInfo,
  trackedContainers: (state) => state.trackedContainers,
  smallScreen: (state) => state.smallScreen,

};

const actions = {
  loadLanguagesList: async (context) => {
    if (!context.state.languagesList.length) {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/data`);
        const languagesList = response.data.languages;
        context.commit('SET_LANGUAGES_LIST', languagesList);
        context.commit('SET_DATABASE_STATS', response.data.stats);
      } catch (err) {
        console.warn('Cannot get databse', err);
      }
    }
  },
  deleteCustomCode: (context) => {
    context.commit('SET_CUSTOM_CODE', {
      text: '', tabSize: 0, lines: 0, showEditor: false,
    });
  },
  generateCodeInfo: ({ state, rootState, commit }, fileIndex) => {
    // copy without reference and files
    let codeInfo = { language: {} };
    Object.keys(rootState.options.language)
      .filter((key) => key !== 'files')
      .forEach((key) => {
        codeInfo.language[key] = rootState.options.language[key];
      });


    if (fileIndex === -1) {
      codeInfo.tabSize = state.customCode.tabSize;
      codeInfo.lines = state.customCode.lines;
      codeInfo.short = state.customCode.short;
    } else {
      codeInfo = {
        ...codeInfo,
        ...rootState.options.language.files[fileIndex],
      };
    }
    codeInfo.fileIndex = fileIndex;

    commit('SET_CODE_INFO', codeInfo);
  },
};

const mutations = {
  SET_LANGUAGES_LIST: (state, list) => {
    state.languagesList = list;
  },
  SET_DATABASE_STATS: (state, stats) => {
    state.databaseStats = stats;
  },
  SET_CUSTOM_CODE: (state, code) => {
    Vue.set(state, 'customCode', code);
  },
  USE_CUSTOM_CODE: (state, message) => {
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
  SMALL_SCREEN(state) {
    state.smallScreen = true;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
