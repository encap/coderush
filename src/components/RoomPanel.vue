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
          <!-- <span class="btn-text">
              Disconnect
            </span> -->
        </button>
      </div>
      <div v-if="room.owner && showRoomLink" class="popUp">
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

      <PlayersList v-if="room.connected && $route.path !== '/run'" />
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
      console.warn('connected');
    },
    room_created() {
      this.$store.commit('SET_ROOM_PROPERTY', ['connected', true]);
      this.$store.commit('SET_ROOM_PROPERTY', ['name', this.roomName]);
      this.$store.commit('SET_ROOM_PROPERTY', ['myName', this.playerName]);
      this.$store.commit('SET_ROOM_PROPERTY', ['ownerName', this.playerName]);
      this.$store.commit('SET_ROOM_PROPERTY', ['owner', true]);
      this.$store.commit('SET_ROOM_PROPERTY', ['players', {
        [this.playerName]: {
          connected: true,
          ready: true,
          owner: true,
        },
      }]);
      setTimeout(() => this.$refs.closeInfoBtn.focus(), 100);
    },
    room_exist() {
      if (this.action === 'create') {
        console.error('ROOM ALREADY EXIST');
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
        console.error('ROOM DONT EXIST');
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
      this.$router.push('/');
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
        ownerName: this.playerName,
        roomName: this.roomName,
        options: {
          codeLength: this.options.codeLength,
          autoIndent: this.options.autoIndent,
        },
        languageIndex: this.language.index,
      });
      this.showRoomLink = true;
    },
    checkPlayerName() {
      this.$socket.client.emit('checkPlayerName', this.playerName);
    },
    joinRoom() {
      this.$socket.client.emit('joinRoom');
      this.askForPlayerName = false;
      this.hidePopUp = true;
      setTimeout(() => { this.popUp = false; }, 500);
    },
    disconnect(action = false) {
      this.$socket.client.close();
      this.$store.commit('SET_ROOM_PROPERTY', ['connected', false]);
      this.$store.commit('SET_ROOM_PROPERTY', ['name', '']);
      this.$store.commit('SET_ROOM_PROPERTY', ['owner', false]);
      if (action) {
        this.askForPlayerName = false;
        this.roomName = '';
      } else {
        this.askForPlayerName = false;
      }
    },
    copy() {
      console.log(this.$refs.shareLink);
      this.$refs.shareLink.select();
      document.execCommand('copy');
      console.log('copied');
    },
    resetInfoMsg() {
      this.roomInfoMsg = '';
    },
  },
};
</script>

<style lang="sass" scoped>
@mixin small-btn
  text-align: center
  width: 40%
  padding: $grid-gap
  border-left: 1px solid $grey
  @include navbar-mouse-effect

svg
    margin-top: $grid-gap

input
  margin-left: 1em
  border-bottom: 1px solid $grey
  overflow: hidden
  padding: $grid-gap

.roomNotConnected
  display: flex
  flex-direction: column
  justify-content: space-between

  .popUp
    position: fixed
    top: 0
    bottom: 0
    left: 0
    right: 0
    background-color: rgba($grid-color, .7)
    display: flex
    justify-content: space-around
    align-items: center
    pointer-events: all
    user-select: none
    z-index: 10
    transition: opacity 2s ease-in-out

    &.hide-popUp
      opacity: 0

    .wrapper
      width: 50vw
      text-align: center
      display: flex
      align-items: center
      flex-wrap: wrap
      flex-direction: column

      h2
        font-size: 2.5rem

      .playerName
        margin: 3rem 0
      .playerName, .buttons
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
  .popUp
    margin-bottom: 2em
    .shareLink
      display: flex
      justify-content: space-between
      margin: 1em 0

    input
      flex-grow: 1

    .close-btn
      @include small-btn

  .roomNameContainer
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: 1em

    svg
      margin-bottom: $grid-gap
      margin-left: 1em

input::placeholder
    color: $grey

button:disabled
  cursor: not-allowed

</style>
