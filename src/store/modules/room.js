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
      console.log('admin disconnected');
      this._vm.$socket.client.disconnect();
      commit('SET_ROOM_PROPERTY', ['connected', false]);
      commit('SET_ROOM_PROPERTY', ['name', '']);
      commit('SET_ROOM_PROPERTY', ['owner', false]);
      commit('SET_ROOM_PROPERTY', ['newGameRequest', false]);
      commit('SET_ROOM_PROPERTY', ['players', {}]);
    }

    commit('PLAYER_LOST_CONNECTION', {
      playerName: msg.playerName,
      currentState: 'lostConnection',
    });

    commit('RESET_PLAYER', msg.playerName);

    console.log(`player "${msg.playerName}" disconnected`);

    setTimeout(() => {
      commit('PLAYER_LOST_CONNECTION', {
        playerName: msg.playerName,
        currentState: 'disconnected',
      });
    }, 5000);
  },
  socket_roomState({ commit, rootState }, roomState) {
    commit('SET_ROOM_PROPERTY', ['name', roomState.roomName]);
    commit('SET_ROOM_PROPERTY', ['connected', true]);

    const playersObject = {};
    roomState.players.forEach((player) => {
      playersObject[player.name] = player;
    });
    commit('SET_ROOM_PROPERTY', ['players', playersObject]);

    if (roomState.languageIndex) {
      commit('SET_LANGUAGE', rootState.misc.languagesList[roomState.languageIndex]);
    } else {
      commit('SET_LANGUAGE', {
        index: null,
        name: '',
      });
    }

    if (roomState.customCode) {
      commit('SET_CUSTOM_CODE', roomState.customCode);
    } else {
      commit('SET_CUSTOM_CODE', {
        text: '',
        tabSize: 0,
        lines: 0,
        showEditor: false,
      });
    }

    if (roomState.options) {
      Object.entries(roomState.options).forEach((option) => {
        commit('SET_OPTION', { name: option[0], value: option[1] });
      });
    } else {
      commit('SET_OPTION', { name: 'selectedMode', value: 0 });
      commit('SET_OPTION', { name: 'codeLength', value: false });
      commit('SET_OPTION', { name: 'autoIndent', value: true });
    }
  },
  socket_optionChange({ commit }, option) {
    commit('SET_OPTION', option);
  },
  socket_languageChange({ commit, rootState }, languageIndex) {
    commit('SET_LANGUAGE', rootState.misc.languagesList[languageIndex]);
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
    Object.keys(state.room.players).forEach((playerName) => {
      commit('RESET_PLAYER', playerName);
    });
  },
  socket_requestNewGame({ commit, state }) {
    if (!state.room.players[state.room.myName].inLobby) {
      commit('SET_ROOM_PROPERTY', ['newGameRequest', true]);
    }
  },
};

const mutations = {
  SOCKET_PLAYER_STATE_CHANGE(state, message) {
    Vue.set(state.room.players[message.playerName], 'ready', message.currentState);
  },
  SOCKET_PLAYER_IN_LOBBY(state, message) {
    Vue.set(state.room.players[message.playerName], 'inLobby', message.currentState);
  },
  SOCKET_PLAYER_JOINED(state, playerData) {
    console.log(`player "${playerData.name}" joined`);
    console.log(playerData);
    // Vue reactivity edgecase
    Vue.set(state.room.players, playerData.name, playerData);
  },
  SOCKET_PLAYER_COMPLETED(state, message) {
    Vue.set(state.room.players[message.playerName], 'completed', true);
    Vue.set(state.room.players[message.playerName], 'time', message.time);
    Vue.set(state.room.players[message.playerName], 'place', message.place);
  },
  SOCKET_PLAYER_STATS(state, message) {
    Vue.set(state.room.players[message.playerName], 'stats', message.stats);
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
    Vue.delete(state.room.players[playerName], 'place');
  },

  SET_ROOM_PROPERTY(state, [property, value]) {
    Vue.set(state.room, property, value);
  },

};

export default {
  state,
  getters,
  actions,
  mutations,
};
