import Vue from 'vue';

const state = {
  room: {
    connected: false,
    name: '',
    players: {},
    myName: '',
    owner: false,
  },
};

const getters = {
  room: (state) => state.room,
  players: (state) => state.room.players,
};

const actions = {
  socket_playerDisconnected({ commit }, msg) {
    if (msg.owner) {
      commit('SET_ROOM_PROPERTY', ['connected', false]);
      setTimeout(() => {
        commit('SET_ROOM_PROPERTY', ['name', 'Room closed']);
      }, 20000);
    }

    commit('PLAYER_LOST_CONNECTION', {
      playerName: msg.playerName,
      currentState: 'lostConnection',
    });
    setTimeout(() => {
      commit('PLAYER_LOST_CONNECTION', {
        playerName: msg.playerName,
        currentState: 'disconnected',
      });
    }, 5000);
  },
  socket_roomState({ commit }, roomState) {
    commit('SET_ROOM_PROPERTY', ['name', roomState.roomName]);
    commit('SET_ROOM_PROPERTY', ['connected', true]);
    const playersObject = {};
    roomState.players.forEach(({
      name, ready, connected, owner,
    }) => {
      playersObject[name] = { ready, connected, owner };
    });
    commit('SET_ROOM_PROPERTY', ['players', playersObject]);
    Object.entries(roomState.options).forEach((option) => {
      commit('SET_OPTION', option);
    });
  },
  socket_optionChange({ commit }, option) {
    commit('SET_OPTION', option);
  },
  socket_languageChange({ commit, rootState }, languageIndex) {
    commit('SET_LANGUAGE', rootState.other.languagesList[languageIndex]);
  },
  socket_fileIndex({ dispatch }, fileIndex) {
    dispatch('generateCodeInfo', fileIndex);
  },
  socket_customCodeData({ commit }, data) {
    commit('SET_CUSTOM_CODE', data);
  },
  socket_useCustomCode({ commit }, message) {
    commit('USE_CUSTOM_CODE', message);
  },
  socket_reset({ commit, state }) {
    commit('SET_ROOM_PROPERTY', ['ready', false]);
    Object.keys(state.room.players).forEach((playerName) => {
      commit('RESET_PLAYER', playerName);
    });
  },
};

const mutations = {
  SOCKET_PLAYER_STATE_CHANGE(state, message) {
    Vue.set(state.room.players[message.playerName], 'ready', message.currentState);
  },
  SOCKET_PLAYER_JOINED(state, playerName) {
    console.log('JOIN');
    // Vue reactivity caveat
    Vue.set(state.room.players, playerName, {
      ready: false,
      connected: true,
    });
  },
  SOCKET_PLAYER_COMPLETED(state, message) {
    Vue.set(state.room.players[message.playerName], 'completed', true);
    Vue.set(state.room.players[message.playerName], 'time', message.time);
  },
  SOCKET_PLAYER_STATS(state, message) {
    Vue.set(state.room.players[message.playerName], 'stats', message.stats);
  },
  SOCKET_ROOM_READY(state, value) {
    state.room.ready = value;
  },
  PLAYER_LOST_CONNECTION(state, { playerName, currentState }) {
    if (currentState === 'lostConnection') {
      Vue.set(state.room.players[playerName], 'connected', false);
    } else {
      Vue.delete(state.room.players, playerName);
    }
  },
  RESET_PLAYER(state, playerName) {
    Vue.delete(state.room.players[playerName], 'stats');
    Vue.delete(state.room.players[playerName], 'completed');
    Vue.delete(state.room.players[playerName], 'time');
  },
  LATENCY(state, ownerStartTime) {
    state.room.ownerStartTime = ownerStartTime;
  },
  SET_ROOM_PROPERTY(state, [property, value]) {
    console.log(property, value);
    Vue.set(state.room, property, value);
  },

};

export default {
  state,
  getters,
  actions,
  mutations,
};
