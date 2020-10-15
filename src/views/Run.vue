<template>
  <main
    :key="resetSelfKey"
    :class="{wide: stats }"
    @keydown.alt="resetSelf"
  >
    <div class="top-bar">
      <div class="info">
        <div class="languageName">
          <h2>{{ languageName }}</h2>
        </div>
        <div class="codeInfo">
          <p v-if="codeInfo.name">
            {{ codeInfo.name }}.{{ language.ext }}
          </p>
          <p>{{ codeSource }}</p>
        </div>
      </div>
      <h2 v-if="timer !== null && $route.path === '/run'" class="timer">
        {{ timer }}
      </h2>
      <div class="buttons">
        <button v-show="!room.connected" class="reset" @click="reset">
          Restart
        </button>
        <button
          v-show="$route.path !== '/results' && !room.connected"
          class="finish"
          :disabled="room.connected"
          @click="finish"
        >
          Finish now
        </button>
      </div>
    </div>


    <!-- Changing key remounts component -->
    <CodeEditor
      v-if="language.name"
      ref="codeEditor"
      :key="resetEditorKey"
      class="code-editor"
      @reset="reset"
      @completed="completed"
      @start="startTimer"
      @pause="(action) => {pause = action}"
    />

    <div
      v-show="$route.path === '/results' && stats"
      ref="results"
      class="results"
    >
      <Results
        v-if="stats"
        :stats="stats"
      />
    </div>
  </main>
</template>

<script>
import { mapGetters } from 'vuex';

import CodeEditor from '@/components/CodeEditor.vue';

const Results = () => import(/* webpackChunkName: "results" */ '@/views/Results.vue');

export default {
  name: 'Run',
  components: {
    CodeEditor,
    Results,
  },
  data() {
    return {
      resetSelfKey: 1,
      resetEditorKey: 1,
      stats: false,
      timer: null,
      pause: false,
      intervalId: null,
    };
  },
  computed: {
    ...mapGetters(['language', 'customCode', 'codeInfo', 'room', 'options']),
    codeSource() {
      if (this.codeInfo.name) {
        return this.codeInfo.source === 'own' ? 'Łukasz Wielgus archive' : this.codeInfo.source;
      } if (this.room.connected && !this.room.owner) {
        return 'Code provided by room owner';
      }
      return 'Code provided by You';
    },
    languageName() {
      if (this.language) {
        return this.language.name.replace('_', ' ');
      }
      return '';
    },

  },
  created() {
    if (this.language.index === null) {
      this.$router.push('/');
    }
  },
  beforeRouteUpdate(to, from, next) {
    if (to.path === '/results') {
      setTimeout(() => {
        this.$refs.results.scrollIntoView({
          block: 'start',
          inline: 'nearest',
          behavior: 'smooth',
        });
      }, 100);
    }

    next();
  },
  beforeDestroy() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
  },
  methods: {
    reset() {
      this.stats = false;
      this.resetEditorKey += 1;
      if (this.intervalId) {
        window.clearInterval(this.intervalId);
      }

      if (this.$route.path === '/results') {
        this.$router.push('/run');
      }
    },
    resetSelf() {
      this.resetSelfKey += 1;
      if (this.$route.path === '/results') {
        this.$router.push('/run');
      }
    },
    startTimer() {
      this.timer = 100;
      this.intervalId = window.setInterval(() => {
        if (this.timer === 0) {
          this.$refs.codeEditor.completed();
        } else if (!this.pause) {
          this.timer -= 1;
        }
      }, 1000);
    },
    finish() {
      this.$refs.codeEditor.completed(true);
    },
    completed(stats) {
      this.stats = stats;
      if (this.intervalId) {
        window.clearInterval(this.intervalId);
      }
    },
    disconnect() {
      this.requestReset = false;
      this.$socket.client.disconnect();
      this.$store.commit('SET_ROOM_PROPERTY', ['connected', false]);
    },
  },
};

</script>

<style lang="sass" scoped>
main
  display: flex
  justify-content: flex-start
  flex-direction: column
  position: relative
  width: 100%
  max-width: 1300px
  min-height: calc(100vh - #{2 * $gap})

  &.wide
    max-width: none

  .code-editor
    flex-grow: 1
    margin: 1rem 0

.top-bar
  display: flex
  align-items: center
  justify-content: space-between
  animation: opacity-enter .5s ease-out forwards .7s
  animation-fill-mode: both
  position: relative

  .info
    display: flex
    align-items: center
    flex-shrink: 2
    position: relative
    min-width: 0

    .languageName
      font-size: 2rem
      margin-right: 1em
      min-width: 0

      h2
        overflow: hidden
        text-overflow: ellipsis

    .codeInfo
      display: flex
      justify-content: space-between
      flex-direction: column
      flex-shrink: 2
      min-width: 0

      p
        margin-bottom: $thin-gap
        overflow: hidden
        min-width: 0
        text-overflow: ellipsis

  .buttons
    flex-shrink: 0
    button
      background: $navy-grey
      padding: 0 0.5em
      margin-left: max(10px, calc(20vw - 210px))
      text-align: center
      height: 47px
      min-width: 150px

.results
  padding-top: 1rem
  width: 100%
  max-width: 100%
</style>
