<template>
  <nav>
    <button class="title" @click="mainPage">
      CodeRush
    </button>

    <div class="links" :class="{'room-connected': room.connected}">
      <router-link to="/" class="link">
        <fa :icon="['fas', 'play']" :class="{flip: $route.path === '/run'}" />
        <span class="btn-text">
          Start
        </span>
      </router-link>
      <div class="line" />
      <button class="link language" @click="$store.commit('USER_LANGUAGE')">
        <fa v-if="userLanguage" :icon="['fas', 'globe-americas']" />
        <fa v-else :icon="['fas', 'globe-europe']" />
        <span class="btn-text">
          {{ userLanguage ? 'English Here' : 'Polska wersja' }}
        </span>
      </button>
      <div class="line" />
      <router-link to="/about" class="link">
        <fa :icon="['fas', 'info']" />
        <span class="btn-text">
          About
        </span>
      </router-link>
      <div class="line" />
      <router-link to="/contribute" class="link">
        <fa :icon="['fas', 'file-code']" />
        <span class="btn-text">
          Contribute
        </span>
      </router-link>
    </div>
    <div class="room">
      <div v-if="!room.connected" class="roomNotConnected">
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
          >
        </div>

        <div v-if="roomName" class="buttons">
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



        <div v-if="askForPlayerName" class="nick-actions">
          <div class="playerName">
            <fa :icon="['fas', 'user']" />
            <input
              v-model="playerName"
              maxlength="14"
              type="text"
              placeholder="Nick"
              @input="resetInfoMsg"
            >
          </div>
          <div class="buttons">
            <button v-if="action === 'create'" :disabled="!playerName" @click="createRoom">
              <span class="btn-text">
                Ok
              </span>
            </button>
            <button v-else :disabled="playerName === ''" @click="checkPlayerName">
              <span class="btn-text">
                Join room
              </span>
            </button>
            <button @click="disconnect()">
              <span class="btn-text">
                Close
              </span>
            </button>
          </div>
        </div>

        <p v-if="roomInfoMsg" class="info">
          {{ roomInfoMsg }}
        </p>
      </div>
      <div v-else class="roomConnected">
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
          <button class="close-btn" @click="showRoomLink = false">
            <span class="btn-text">
              Close
            </span>
          </button>
        </div>

        <PlayersList v-if="room.connected && $route.path !== '/run'" />
      </div>
    </div>
    <div class="author">
      <span class="author-text">
        Made with <fa :icon="['fas', 'heart']" class="heart" /> by <span class="author-name">Łukasz Wielgus</span>
      </span>
    </div>
  </nav>
</template>

<script>
import PlayersList from '@/components/PlayersList.vue';
import { mapGetters } from 'vuex';


export default {
  name: 'NavBar',
  components: {
    PlayersList,
  },
  data() {
    return {
      roomName: '',
      playerName: '',
      roomInfoMsg: '',
      showRoomCreator: false,
      showRoomLink: true,
      askForPlayerName: false,
      origin: window.location.origin,
    };
  },
  computed: {
    ...mapGetters(['room', 'options', 'language', 'userLanguage']),
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
          ready: false,
          owner: true,
        },
      }]);
    },
    room_exist() {
      if (this.action === 'create') {
        console.error('ROOM ALREADY EXIST');
        this.roomInfoMsg = `Room "${this.roomName}" already exists.`;
        this.disconnect();
      } else {
        this.askForPlayerName = true;
      }
    },
    room_dont_exist() {
      if (this.action === 'create') {
        this.askForPlayerName = true;
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
      this.checkRoom('join');
      this.$router.push('/');
    }
  },
  methods: {
    mainPage() {
      if (this.room.owner) {
        this.$socket.client.emit('reset');
      }
      this.$router.push('/');
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
    },
    checkPlayerName() {
      this.$socket.client.emit('checkPlayerName', this.playerName);
    },
    joinRoom() {
      this.$socket.client.emit('joinRoom');
      this.askForPlayerName = false;
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
@mixin padding-left
  padding-left: 1.2rem
  padding-right: 1.2rem

@mixin mouse-effect
  transition: background-color .15s ease-in-out

  &:hover
    background-color: rgba($white, .1)

  &:active
    background-color: rgba($white, .2)

@mixin small-btn
  text-align: center
  width: 40%
  padding: $grid-gap
  border-left: 1px solid $grey
  @include mouse-effect

.title
  // margin-top: 4% // 10-6
  font-size: 2rem
  font-weight: 600
  padding: 1.1rem 0
  width: 100%
  transition: opacity $nav-trans-dur $nav-trans-timing $nav-trans-dur, background-color .15s ease-in-out
  @include padding-left
  @include mouse-effect

nav
  height: 100%
  padding: 6% 0
  display: flex
  flex-direction: column
  justify-content: flex-start
  background: linear-gradient(340deg, $navy-grey, $navy-grey 20%, $washed-purple)
  // border-radius: 3px
  font-size: 1rem
  position: relative

nav:after
  content: ''
  position: absolute
  pointer-events: none
  @include pos0
  transition: backdrop-filter $nav-trans-dur $nav-trans-timing 0s

.thin:after
  // backdrop-filter: hue-rotate(20deg)
  transition-delay: 1s
  backdrop-filter: hue-rotate(10deg) brightness(80%)

.thin
  $translate: translateX(calc(#{$nav-size} - 2.5em - #{$nav-move} / 2))
  .btn-text, .title, .room
    transition-delay: 0s
    opacity: 0
  svg:not(.heart)
    transition-delay: $nav-trans-dur
    transform: $translate
  .flip
    transform: $translate rotate(180deg) !important
  .author
    opacity: 0
    transition-delay: $nav-trans-dur

.btn-text, .room, .author
  transition: opacity $nav-trans-dur $nav-trans-timing $nav-trans-dur

.links
  margin: 6% 0 10% 0
  $line: 1px solid $grey
  border-top: $line
  border-bottom: $line
  min-height: 40%
  display: flex
  flex-direction: column
  justify-content: space-evenly
  transition: min-height .5s ease-in-out


  .link
    display: block
    width: 100%
    padding: 1.1rem
    @include padding-left
    @include mouse-effect


  .line
    width: 100%
    // border-bottom: 1px solid $grey

  .btn-text
    margin-left: 1em

.links.room-connected
  min-height: 25%

svg
  display: inline-block
  width: 1em !important
  transition: transform $nav-trans-dur $nav-trans-timing 0s

.room
  flex-grow: 1
  @include padding-left

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

input::placeholder
    color: $grey

button:disabled
  cursor: not-allowed

.author
  @include padding-left

  .author-text
    font-size: .9em

    .author-name
      white-space: nowrap

</style>
