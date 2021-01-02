<template>
  <main
    :key="resetSelfKey"
    :class="{wide: stats }"
  >
    <div class="top-bar">
      <div class="info">
        <div class="languageName">
          <h2>{{ languageName }}</h2>
        </div>
        <div class="codeInfo">
          <p v-if="codeInfo.name">
            {{ codeInfo.name }}.{{ codeInfo.language.ext }}
          </p>
          <p>{{ codeSource }}</p>
        </div>
      </div>

      <div v-show="!completed" class="counters">
        <span v-show="!pause && timer !== null">
          {{ timer > 120 ? Math.floor(timer / 60) + ' min ' + timer % 60 : timer }} s {{ options.selectedMode === 1 ? 'remaining' : '' }}
        </span>
        <span v-show="pause">paused</span>
        <span v-show="timer === null">waiting</span>

        <ICountUp
          :key="resetEditorKey"
          class="live-wpm"
          :end-val="endWpm"
          :options="liveWpmOptions"
          @ready="onLiveWpmReady"
        />
      </div>


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
      v-if="languageName"
      ref="codeEditor"
      :key="resetEditorKey"
      class="code-editor"
      @reset="reset"
      @completed="onCompleted"
      @start="startTimer"
      @pause="(action) => {pause = action}"
      @liveWpmUpdate="updateLiveWpm"
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

import ICountUp from 'vue-countup-v2';
import CodeEditor from '@/components/CodeEditor.vue';

const Results = () => import(/* webpackChunkName: "results" */ '@/views/Results.vue');

export default {
  name: 'Run',
  components: {
    ICountUp,
    CodeEditor,
    Results,
  },
  data() {
    return {
      resetSelfKey: 1,
      resetEditorKey: 1,
      stats: false,
      completed: false,
      timer: null,
      pause: false,
      intervalId: null,
      endWpm: 0,
    };
  },
  computed: {
    ...mapGetters(['codeInfo', 'room', 'options']),
    liveWpmOptions() {
      return {
        duration: this.options.liveWpmRefreshRate / 1000,
        useEasing: false,
        useGrouping: false,
        decimalPlaces: 0,
        decimal: '.',
        suffix: ' WPM',
      };
    },
    codeSource() {
      if (this.codeInfo.name) {
        return this.codeInfo.source === 'own' ? 'Łukasz Wielgus archive' : this.codeInfo.source;
      } if (this.room.connected && !this.room.admin) {
        return 'Code provided by room admin';
      }
      return 'Code provided by You';
    },
    languageName() {
      return this.codeInfo.language.name.replace('_', ' ');
    },

  },
  created() {
    if (this.codeInfo && !this.codeInfo.lines) {
      // if user opened /run directly
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
    if (this.room.connected) {
      // reset players locally but let them finish and view results until admin clicks start again
      this.$store.dispatch('socket_reset');
    }
  },
  methods: {
    reset() {
      this.stats = false;
      this.resetEditorKey += 1;
      this.liveWpmInstance = null;
      if (this.intervalId) {
        window.clearInterval(this.intervalId);
        this.timer = null;
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
      console.log('timer start');
      this.completed = false; // after reset or try again
      this.timer = this.options.selectedMode === 1 ? 100 : 0;
      this.intervalId = setInterval(() => {
        if (!this.pause) {
          if (this.options.selectedMode === 1) {
            if (this.timer === 0) {
              this.$refs.codeEditor.completed();
            } else {
              this.timer -= 1;
            }
          } else {
            this.timer += 1;
          }
        }
      }, 1000);
    },
    onLiveWpmReady(instance) {
      if (!this.liveWpmInstance) {
        console.warn('LIVEWPM READY');
        this.liveWpmInstance = instance;
      }
    },
    updateLiveWpm(wpm) {
      console.log(`updating to ${wpm}`);
      this.liveWpmInstance.update(wpm);
    },
    finish() {
      this.$refs.codeEditor.completed();
    },
    onCompleted(stats) {
      this.stats = stats;
      this.completed = true;
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
    flex-grow: 1 //dev
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
    flex-grow: 1
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

  .codeInfo, .counters
    display: flex
    justify-content: space-between
    flex-direction: column
    flex-shrink: 2
    min-width: 0

    p, span
      margin-bottom: $thin-gap
      overflow: hidden
      min-width: 0
      text-overflow: ellipsis

  .counters
    text-align: right

  .buttons
    flex-shrink: 0
    button
      background: $navy-grey
      padding: 0 0.5em
      margin-left: min(5em, max(1em, calc(20vw - 210px)))
      text-align: center
      height: 47px
      min-width: 150px

.results
  padding-top: 1rem
  width: 100%
  max-width: 100%
</style>
