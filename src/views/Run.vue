<template>
  <main
    :key="resetSelfKey"
    @keydown.alt="resetSelf"
  >
    <div class="top-bar">
      <template v-if="requestReset">
        <div class="info">
          <div class="codeInfo">
            <h2>Room owner wants to start a new game</h2>
            <p>You will be moved to lobby</p>
          </div>
        </div>
        <div class="buttons">
          <button @click="$router.push('/')">
            OK
          </button>
          <button class="disconnect-btn" @click="disconnect">
            Leave room and code
          </button>
        </div>
      </template>
      <template v-else>
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
        <div class="buttons">
          <button class="reset" :disabled="room.connected" @click="reset">
            Restart
          </button>
          <button
            v-show="$route.path !== '/results'"
            class="finish"
            :disabled="room.connected"
            @click="finish"
          >
            Finish now
          </button>
        </div>
      </template>
    </div>


    <!-- Changing key remounts component -->
    <CodeEditor
      v-if="language.name"
      ref="codeEditor"
      :key="resetEditorKey"
      class="code-editor"
      @reset="reset"
      @completed="completed"
    />

    <Results
      v-if="stats"
      v-show="$route.path === '/results' && stats"
      :stats="stats"
      class="results"
    />
  </main>
</template>

<script>
import CodeEditor from '@/components/CodeEditor.vue';
import Results from '@/views/Results.vue';
import { mapGetters } from 'vuex';

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
      requestReset: false,

    };
  },
  computed: {
    ...mapGetters(['language', 'customCode', 'codeInfo', 'room']),
    codeSource() {
      if (this.codeInfo.name) {
        return this.codeInfo.source === 'own' ? 'Łukasz Wielgus archive' : this.codeInfo.source;
      } if (this.room.connected && !this.room.owner) {
        return 'Code provided by room owner';
      }
      return 'Code provided by You';
    },
    languageName() {
      return this.language.name.replace('_', ' ');
    },

  },
  created() {
    if (!this.language.name) {
      this.$router.push('/');
    }
  },
  sockets: {
    reset() {
      this.requestReset = true;
    },
  },
  methods: {
    reset() {
      if (this.$route.path === '/results') {
        this.resetSelfKey += 1;
        this.$router.push('/run');
      } else {
        this.resetEditorKey += 1;
      }
    },
    resetSelf() {
      this.resetSelfKey += 1;
      if (this.$route.path === '/results') {
        this.$router.push('/run');
      }
    },
    finish() {
      this.$refs.codeEditor.completed(true);
    },
    completed(stats) {
      this.stats = stats;
    },
    disconnect() {
      this.requestReset = false;
      this.$socket.client.disconnect();
      this.$store.commit('SET_ROOM_PROPERTY', ['connected', false]);
      this.$store.commit('SET_ROOM_PROPERTY', ['ready', false]);
    },
  },
};

</script>

<style lang="sass" scoped>
main
  min-height: calc(100vh - #{2 * $gap})
  max-width: 1300px
  width: 100%
  position: relative
  flex-direction: column
  display: flex
  justify-content: flex-start

  .code-editor
    flex-grow: 1
    margin: 1rem 0

.top-bar
  display: flex
  justify-content: space-between
  align-items: center
  position: relative
  animation: opacity-enter .5s ease-out forwards .7s
  animation-fill-mode: both

  .info
    position: relative
    display: flex
    align-items: center
    min-width: 0

    .languageName
      font-size: 2rem
      margin-right: 1em
    .codeInfo
      display: flex
      justify-content: space-between
      flex-direction: column
      overflow: hidden
      p
        margin-bottom: $grid-gap

  .buttons
    flex-shrink: 0
    button
      text-align: center
      min-width: 150px
      padding: 0 0.5em
      height: 47px
      background: $grid-color
      margin-left: max(10px, calc(20vw - 210px))
      cursor: pointer

@keyframes opacity-enter
  from
    opacity: 0
  to
    opacity: 1


.results
  width: 100%


</style>
