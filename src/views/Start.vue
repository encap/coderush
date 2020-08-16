<template>
  <div class="start">
    <main class="middle">
      <div ref="scroll" class="upload-scroll">
        <SettingsMenu ref="settings" class="settings-menu" />
        <keep-alive>
          <UploadCode v-if="showEditor" ref="code" class="code-editor" />
        </keep-alive>
      </div>


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
        <label v-if="room.connected" class="button ready-btn" :class="{ highlight: isReady }">
          <span>Ready</span>
          <input
            v-model="isReady"
            type="checkbox"
            :disabled="!language.name && room.owner"

            @input="ready($event.target.checked)"
          >
        </label>
        <button
          :disabled="(room.owner && playersNotReady) || (room.connected && !room.owner) || (room.owner && !isReady)"
          class="button start-btn"
          :class="{ highlight: language.name }"
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
import UploadCode from '@/components/UploadCode.vue';
import { mapGetters } from 'vuex';

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
    playersNotReady() {
      // eslint-disable-next-line no-return-assign
      const notReadyCount = Object.values(this.room.players).reduce((acc, player) => (player.ready ? acc += 1 : acc), 0);
      return this.room.players.length / notReadyCount < 0.4;
    },
  },
  activated() {
    if (this.customCode.showEditor) {
      this.$refs.code.$refs.codemirror.$el.scrollIntoView({
        block: 'start',
        inline: 'nearest',
      });
    }
  },
  methods: {
    useCustomCode(value) {
      console.warn('usecustomcode', value);
      if (value) {
        this.showEditor = value;
        this.$store.commit('USE_CUSTOM_CODE', true);

        setTimeout(() => {
          // this.$refs.code.$el.style.display = 'flex';
          this.$refs.code.$refs.codemirror.$el.scrollIntoView({
            block: 'start',
            inline: 'nearest',
            behavior: 'smooth',
          });
        }, 30);
      } else {
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
      console.log('run');
      if (!this.language.name) {
        this.$refs.languagesList.selectRandom();
      }
      if (this.showEditor) {
        if (this.customCode.text.length < 30 || this.customCode.lines < 4) {
          this.error = 'Try something a little bit longer';
          return;
        }
        if (this.room.owner) {
          this.$socket.client.emit('customCodeData', this.customCode);
        }
      }
      this.prepareCodeInfo();
      if (this.room.owner) {
        this.$socket.client.emit('start', Date.now());
      }
      if (window.location.hash || localStorage.getItem('myUniverse')) {
        localStorage.setItem('myUniverse', true);
        this.$router.push('myuniverse');
      } else {
        this.$router.push('run');
      }
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
      this.$store.commit('LATENCY', ownerStartTime);
      this.$router.push('run');
    },
  },
};
</script>

<style lang="sass" scoped>
.start
  position: relative
  display: flex
  justify-content: flex-end
  flex-basis: 0
  height: calc(100vh - 2 * #{$gap})

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
  // height: calc(100vh - 2 * #{$gap})
  display: flex
  flex-direction: column

</style>
