<template>
  <div class="room">
    <div v-show="!room.connected" class="roomNotConnected">
      <p class="room-text">
        Play with your friends:
      </p>
      <div class="roomName">
        <fa :icon="['fas', 'server']" />
        <input
          v-model="roomName"
          maxlength="14"
          type="text"
          placeholder="Room name"
          @input="resetInfoMsg"
          @keydown.enter="handleEnter"
        >
      </div>

      <div v-show="roomName" class="buttons">
        <button :disabled="roomName === ''" @click="checkRoom('create')">
          <span class="btn-text">
            Create
          </span>
        </button>

        <button :disabled="roomName === ''" @click="checkRoom('join')">
          <span class="btn-text">
            Connect
          </span>
        </button>
      </div>


      <div
        v-show="askForPlayerName"
        class="nick-actions"
        :class="{ popUp: popUp, 'hide-popUp': hidePopUp}"
      >
        <div class="wrapper">
          <h2 v-show="popUp">
            Enter a username to continue
          </h2>
          <div class="playerName">
            <fa :icon="['fas', 'user']" />
            <input
              ref="playerNameInput"
              v-model="playerName"
              maxlength="14"
              type="text"
              placeholder="Nick"
              @input="resetInfoMsg"
              @keydown.enter="handleEnter"
            >
          </div>
          <p v-if="roomInfoMsg && popUp" class="info">
            {{ roomInfoMsg }}
          </p>
          <div class="buttons">
            <button v-show="action === 'create'" :disabled="!playerName" @click="createRoom">
              <span class="btn-text">
                Ok
              </span>
            </button>
            <button v-show="action === 'join'" :disabled="playerName === ''" @click="checkPlayerName">
              <span class="btn-text">
                Join room
              </span>
            </button>
            <button v-show="!popUp" @click="disconnect()">
              <span class="btn-text">
                Close
              </span>
            </button>
          </div>
        </div>
      </div>

      <p v-if="roomInfoMsg" class="info">
        {{ roomInfoMsg }}
      </p>
    </div>

    <div v-show="room.connected" class="roomConnected">
      <div class="roomNameContainer">
        <h2>{{ room.name }}</h2>
        <button class="disconnect-btn" @click="disconnect(true)">
          <fa :icon="['fas', 'sign-out-alt']" size="lg" />
        </button>
      </div>
      <div v-if="room.admin && showRoomLink && $route.path === '/'" class="linkContainer">
        <p>
          Share this link with other players:
        </p>

        <div class="shareLink">
          <button class="copy-btn" @click="copy">
            <fa :icon="['fas', 'copy']" />
          </button>
          <input
            ref="shareLink"
            type="text"
            readonly
            :value="`${origin}/join/${roomName}`"
          >
        </div>
        <button
          ref="closeInfoBtn"
          class="close-btn"
          @click.enter="showRoomLink = false"
        >
          <span class="btn-text">
            Close
          </span>
        </button>
      </div>
    </div>

    <PlayersList v-if="room.connected && $route.path !== '/run'" class="playersList" />

    <div v-if="room.newGameRequest && !room.admin" class="moveToLobby popUp">
      <div class="wrapper">
        <h2>Room owner wants to start a new game.</h2>
        <h3>If you want to stay on current page {{ $route.path === '/results' ? 'and continue reading the results' : '' }} you have to leave the room. You can always join again later.</h3>
        <div class="buttons">
          <button @click="acceptNewGame">
            OK, I understand
          </button>
          <button class="disconnect-btn" @click="disconnect">
            Leave room and stay here
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PlayersList from '@/components/PlayersList.vue';
import { mapGetters } from 'vuex';


export default {
  name: 'RoomPanel',
  components: {
    PlayersList,
  },
  data() {
    return {
      roomName: '',
      playerName: '',
      roomInfoMsg: '',
      action: '',
      showRoomCreator: false,
      showRoomLink: true,
      askForPlayerName: false,
      origin: window.location.origin,
      popUp: false,
      hidePopUp: false,
    };
  },
  computed: {
    ...mapGetters(['room', 'options', 'language']),
  },
  sockets: {
    connect() {
      this.resetInfoMsg();
      console.warn('socket.io connected');
    },
    room_created() {
      this.$store.commit('SET_ROOM_PROPERTY', ['connected', true]);
      this.$store.commit('SET_ROOM_PROPERTY', ['name', this.roomName]);
      this.$store.commit('SET_ROOM_PROPERTY', ['myName', this.playerName]);
      this.$store.commit('SET_ROOM_PROPERTY', ['admin', true]);
      setTimeout(() => this.$refs.closeInfoBtn.focus(), 100);
    },
    room_exist() {
      if (this.action === 'create') {
        console.error('ROOM ALREADY EXISTS');
        this.roomInfoMsg = `Room "${this.roomName}" already exists.`;
        this.disconnect();
      } else {
        this.askForPlayerName = true;
        setTimeout(() => this.$refs.playerNameInput.focus(), 100);
      }
    },
    room_dont_exist() {
      if (this.action === 'create') {
        this.askForPlayerName = true;
        setTimeout(() => this.$refs.playerNameInput.focus(), 100);
      } else {
        this.popUp = false;
        console.error('ROOM DOESN\'T EXIST');
        this.roomInfoMsg = `Room "${this.roomName}" doesn't exist.`;
        this.disconnect();
      }
    },
    player_name_avaible() {
      this.$store.commit('SET_ROOM_PROPERTY', ['myName', this.playerName]);
      this.joinRoom();
    },
    player_name_taken() {
      console.error('PLAYER NAME TAKEN');
      this.roomInfoMsg = `Nick "${this.playerName}" is already taken.`;
    },
  },
  mounted() {
    if (this.$route.params.roomName) {
      this.roomName = this.$route.params.roomName;
      this.popUp = true;
      this.checkRoom('join');
      this.$router.replace('/');
    }
  },
  methods: {
    handleEnter() {
      if (this.askForPlayerName) {
        if (this.action === 'create') {
          this.createRoom();
        } else {
          this.checkPlayerName();
        }
      } else {
        this.checkRoom('create');
      }
    },
    checkRoom(action) {
      this.action = action;
      this.$socket.client.io.opts.query = { roomName: this.roomName };
      this.$socket.client.open();
    },
    createRoom() {
      this.$socket.client.emit('createRoom', {
        adminName: this.playerName,
        roomName: this.roomName,
        options: {
          codeLength: this.options.codeLength,
          autoIndent: this.options.autoIndent,
        },
        languageIndex: this.language.index,
      });
      this.showRoomLink = true;
      if (this.$route.path !== '/') {
        this.$router.push('/');
      }
    },
    checkPlayerName() {
      this.$socket.client.emit('checkPlayerName', this.playerName);
    },
    joinRoom() {
      this.$socket.client.emit('joinRoom');
      this.askForPlayerName = false;
      this.hidePopUp = true;
      setTimeout(() => { this.popUp = false; }, 500);
      if (this.$route.path !== '/') {
        this.$router.push('/');
      }
    },
    disconnect(action = false) {
      this.$socket.client.close();
      this.$store.commit('SET_ROOM_PROPERTY', ['connected', false]);
      this.$store.commit('SET_ROOM_PROPERTY', ['name', '']);
      this.$store.commit('SET_ROOM_PROPERTY', ['admin', false]);
      this.$store.commit('SET_ROOM_PROPERTY', ['newGameRequest', false]);
      this.$store.commit('SET_ROOM_PROPERTY', ['players', {}]);
      if (action) {
        this.askForPlayerName = false;
        this.roomName = '';
      } else {
        this.askForPlayerName = false;
      }
    },
    copy() {
      this.$refs.shareLink.select();
      document.execCommand('copy');
    },
    resetInfoMsg() {
      this.roomInfoMsg = '';
    },
    acceptNewGame() {
      this.$store.commit('SET_ROOM_PROPERTY', ['newGameRequest', false]);
      this.$router.push('/');
    },
  },
};
</script>

<style lang="sass" scoped>
@mixin small-btn
  @include navbar-mouse-effect
  padding: $thin-gap
  border-left: 1px solid $grey
  text-align: center
  width: 40%

.room
  display: flex
  justify-content: flex-start
  flex-direction: column

svg
    margin-top: $thin-gap

input
  padding: $thin-gap
  margin-left: 1em
  border-bottom: 1px solid $grey
  overflow: hidden


.popUp
  display: flex
  align-items: center
  justify-content: space-around
  position: fixed
  top: 0
  bottom: 0
  left: 0
  right: 0
  background-color: rgba($navy-grey, .7)
  transition: opacity 2s ease-in-out
  z-index: 10
  user-select: none
  pointer-events: all

  &.hide-popUp
    opacity: 0

  .wrapper
    display: flex
    align-items: center
    flex-direction: column
    flex-wrap: wrap
    text-align: center
    width: 50vw

  h2
    font-size: 2.5rem


.roomNotConnected
  display: flex
  justify-content: space-between
  flex-direction: column

  .popUp
    .playerName, .buttons
      margin-top: 3rem
      width: 40%
      max-width: 250px

    button
      width: 100%
      height: 35px

  button
    @include small-btn

  .roomName, .playerName
    display: flex
    justify-content: space-between
    margin: 1em 0

  .buttons
    display: flex
    justify-content: space-between


  .info
    margin-top: 1em

.roomConnected
  .linkContainer
    margin-bottom: 1em
    .shareLink
      display: flex
      justify-content: space-between
      margin: 1em 0

    input
      flex-grow: 1
      text-overflow: ellipsis

    .close-btn
      @include small-btn

  .roomNameContainer
    display: flex
    align-items: center
    justify-content: space-between
    margin-bottom: 1em

    svg
      margin-bottom: $thin-gap
      margin-left: 1em

.moveToLobby

  h3
    margin: 2em 0
    max-width: 80%

  button
    @include small-btn
    font-size: 1.2em
    padding-left: 1em
    padding-right: 1em
    margin: 1em 0
    width: auto

  button:first-child
    margin-right: 2em

.playersList
  flex-grow: 1

input::placeholder
    color: $grey

button:disabled
  cursor: not-allowed
</style>
