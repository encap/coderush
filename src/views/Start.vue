<template>
  <div class="start" tabindex="0" @keydown.enter.capture="handleEnter">
    <main class="middle">
      <div ref="scroll" class="upload-scroll">
        <SettingsMenu ref="settings" class="settings-menu" />
        <keep-alive>
          <UploadCode
            v-if="showEditor"
            ref="code"
            class="code-editor"
            @cmReady="onCmReady"
          />
        </keep-alive>
      </div>

      <p v-show="error" class="error">
        {{ error }}
      </p>
      <div class="buttons-bottom">
        <label class="button show-editor-btn">
          <span>{{ uploadCodeText }}</span>
          <input
            :checked="customCode.showEditor"
            :disabled="room.connected && !room.owner"
            type="checkbox"
            @input="useCustomCode($event.target.checked)"
          >
        </label>
        <label v-if="room.connected && !room.owner" class="button ready-btn" :class="{ highlight: isReady }">
          <span>Ready</span>
          <input
            v-model="isReady"
            type="checkbox"

            @input="ready($event.target.checked)"
          >
        </label>
        <button
          :disabled="room.connected && !room.owner"
          class="button start-btn"
          :class="{ highlight: language.name && !(room.connected && !room.owner) }"
          @click="run"
        >
          START
        </button>
      </div>
    </main>
    <LanguagesList ref="languagesList" class="languages-list" />
  </div>
</template>

<script>
import SettingsMenu from '@/components/SettingsMenu.vue';
import LanguagesList from '@/components/LanguagesList.vue';
import { mapGetters } from 'vuex';
import UploadCode from '@/components/UploadCode.vue';
// const UploadCode = () => import(/* webpackChunkName: "upload-code" */ '@/components/UploadCode.vue');

export default {
  name: 'Start',
  components: {
    SettingsMenu,
    LanguagesList,
    UploadCode,
  },
  data() {
    return {
      showEditor: false,
      uploadCodeText: 'Use your own code',
      error: '',
      isReady: false,
    };
  },

  computed: {
    ...mapGetters(['room', 'language', 'options', 'customCode']),
    playersReady() {
      return Object.values(this.room.players).every((player) => player.ready);
    },
    playersInLobby() {
      return Object.values(this.room.players).every((player) => player.inLobby);
    },
  },
  watch: {
    language(current, previous) {
      if (previous && previous.index) {
        this.error = '';
      }
    },
    'room.owner': {
      deep: true,
      handler(current) {
        if (current) {
          this.$socket.client.emit('useCustomCode', this.showEditor);
        }
      },
    },
    customCode: {
      immediate: true,
      deep: true,
      handler(current) {
        if (this.room.connected && !this.room.owner) {
          if (current.showEditor) {
            this.showEditor = current.showEditor;
          } else {
            this.$refs.settings.$el.scrollIntoView({
              block: 'start',
              inline: 'nearest',
              behavior: 'smooth',
            });

            setTimeout(() => {
              this.showEditor = current.showEditor;
            }, 500);
          }
        }
      },
    },

  },
  activated() {
    if (this.customCode.showEditor) {
      this.$refs.code.$refs.codemirror.$el.scrollIntoView({
        block: 'start',
        inline: 'nearest',
      });
    }

    if (this.room.connected && !this.room.owner) {
      console.log('IF');
      this.$socket.client.emit('playerInLobby', true);
    }
  },
  methods: {
    handleEnter() {
      if (!(this.room.connected && !this.room.owner) && !this.showEditor) {
        this.run();
      }
    },
    onCmReady() {
      this.$refs.code.$refs.codemirror.$el.scrollIntoView({
        block: 'start',
        inline: 'nearest',
        behavior: 'smooth',
      });
    },
    useCustomCode(value) {
      if (value) {
        this.showEditor = value;
        this.$store.commit('USE_CUSTOM_CODE', true);
      } else {
        this.error = '';
        this.$store.dispatch('deleteCustomCode');
        this.$refs.settings.$el.scrollIntoView({
          block: 'start',
          inline: 'nearest',
          behavior: 'smooth',
        });

        setTimeout(() => {
          this.showEditor = value;
        }, 500);
      }
      if (this.room.owner) {
        this.$socket.client.emit('useCustomCode', value);
      }




      this.uploadCodeText = value ? 'Cancel' : 'Use your own code';
    },
    run() {
      if (!this.language.name) {
        this.$refs.languagesList.selectRandom();
      }

      if (this.room.connected && !this.playersInLobby) {
        this.error = 'To start a new game all of the players must be in lobby';
        this.$socket.client.emit('reset');
        return;
      }

      if (!this.error) { // second click ignores error
        if (this.showEditor && (this.customCode.text.length < 30 || this.customCode.lines < 4)) {
          this.error = 'Provided code is too short too produce accurate results.';
          return;
        }


        if (this.room.connected && !this.playersReady) {
          this.error = 'Some players aren\'t ready yet. Click again to ignore';
          return;
        }
      }

      if (this.showEditor && this.room.owner) {
        this.$socket.client.emit('customCodeData', this.customCode);
      }

      this.prepareCodeInfo();
      if (this.room.owner) {
        this.$socket.client.emit('start', Date.now());
      }

      this.$router.push('run');
    },
    ready(value) {
      this.$socket.client.emit('playerStateChange', value);
    },
    prepareCodeInfo() {
      let fileIndex = -1;
      if (!this.customCode.text) {
        fileIndex = Math.floor(Math.random() * this.language.files.length);
      }
      this.$store.dispatch('generateCodeInfo', fileIndex);
      if (this.room.owner) {
        this.$socket.client.emit('fileIndex', fileIndex);
      }
    },
  },
  sockets: {
    start(ownerStartTime) {
      console.blue('START');
      this.$store.commit('LATENCY', ownerStartTime);
      this.$router.push('run');
      this.$socket.client.emit('playerInLobby', false);
    },
  },
};
</script>

<style lang="sass" scoped>
.start
  position: relative
  display: flex
  justify-content: flex-end
  height: calc(100vh - 2 * #{$gap})
  outline: none

.middle
  position: relative
  flex-basis: 0
  flex-grow: 2
  max-width: 50%
  margin-right: $gap * 2
  display: flex
  flex-direction: column
  justify-content: space-between

.upload-scroll
  flex-grow: 1
  max-height: 85vh
  overflow: hidden
  position: relative

  .code-editor
    height: 100%
    display: flex
    flex-direction: column


.buttons-bottom
  display: flex
  justify-content: space-between
  align-items: flex-end
  margin-top: $gap
  margin-bottom: $grid-gap

.button
  display: flex
  text-align: center
  justify-content: space-around
  align-items: center
  width: 150px
  height: 47px
  background: $grid-color
  margin-right: $gap
  cursor: pointer
  flex-grow: 1
  max-width: 250px

.start-btn, .ready-btn
  background: linear-gradient(to right, $purple, $light-purple 50%, $grid-color 50% 100%)
  background-size: 200%
  background-position: right

  transition: background .2s ease-in

.start-btn
  margin-right: 0

.highlight
  background-position: left
  transition: background 1.2s ease-out

.languages-list
  position: relative
  max-width: 40%
  flex-grow: 4
  flex-basis: 0
  display: flex
  flex-direction: column

</style>
