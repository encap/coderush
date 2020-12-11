import { getField, updateField } from 'vuex-map-fields';

const state = {
  userLanguage: false,
  language: {
    index: null,
    name: '',
  },
  options: {
    codeLength: false,
    lineNumbers: true,
    selectedTheme: 'material-darker',
    selectedMode: 0,
    autoIndent: true,
    underScore: false,
  },
};

const getters = {
  userLanguage: (state) => state.userLanguage,
  language: (state) => state.language,
  options: (state) => state.options,
  getLanguage: (state) => getField(state),
  getOption: (state) => getField(state.options),
};

const actions = {};

const mutations = {
  USER_LANGUAGE: (state) => {
    state.userLanguage = !state.userLanguage;
  },
  SET_LANGUAGE: (state, languageObj) => {
    state.language = languageObj;
  },
  SET_OPTION: (state, { name, value }) => {
    state.options[name] = value;
  },
  UPDATE_LANGUAGE(state, language) {
    updateField(state, language);
  },
  UPDATE_OPTION(state, option) {
    updateField(state.options, option);
  },

};

export default {
  state,
  getters,
  actions,
  mutations,
};
