<template>
  <div id="app" ref="app">
    <aside
      v-if="!smallScreen"
      ref="navLeft"
      class="nav-left"
      :class="{thin: isThin, run: $route.path === '/run', wide: room.connected }"
    >
      <NavBar :thin="isThin" @start="$children[1].run()" />
    </aside>
    <main>
      <keep-alive :exclude="['Run', 'Results']">
        <router-view />
      </keep-alive>
    </main>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import { mapGetters } from 'vuex';

export default {
  components: {
    NavBar,
  },
  data() {
    return {
      innerWidth: 1920,
    };
  },
  computed: {
    ...mapGetters(['room', 'trackedContainers', 'smallScreen']),
    isThin() {
      const { path } = this.$route;
      // newGameRequest exception because of webkit bug with position: fixed and transfrom http://code.google.com/p/chromium/issues/detail?id=20574
      return !this.room.newGameRequest && (path === '/run' || (this.innerWidth < 1300 && !this.room.connected && path !== '/'));
    },
  },
  created() {
    this.$store.dispatch('loadLanguagesList');

    if (window.innerWidth < 640 || window.innerHeight < 480) {
      this.$store.commit('SMALL_SCREEN');
      this.$router.push('/about');
    }
  },
  mounted() {
    if (window.innerWidth > 1300) {
      document.addEventListener('mousemove', this.trackMouse);

      this.$store.commit('ADD_TRACKED_CONTAINER', this.$refs.navLeft);
    }
    console.log('mounted');

    window.addEventListener('resize', () => {
      this.innerWidth = window.innerWidth;
    });
  },
  methods: {
    trackMouse(ev) {
      if (!this.rafActive) {
        this.rafActive = true;
        requestAnimationFrame(() => {
          this.rafActive = false;
          this.trackedContainers.forEach((element) => {
            const pos = element.getBoundingClientRect();


            const x = ev.clientX - pos.left;
            const y = ev.clientY - pos.top;
            element.style.setProperty('--mouse-x', `${x}px`);
            element.style.setProperty('--mouse-y', `${y}px`);
          });
        });
      }
    },
  },
};
</script>

<style lang="sass" scoped>
#app
  display: flex
  justify-content: space-between
  position: relative
  color: white
  padding: $gap
  width: 100%
  min-height: 100vh

aside
  --nav-trans-dur: #{$nav-trans-dur}
  @include cursor-shadow()
  @include shadow()
  flex-shrink: 0
  padding: $thin-gap
  margin-right: $gap * 2
  min-width: $nav-size
  transition: transform var(--nav-trans-dur) $nav-trans-timing 0s, min-width .5s ease-in-out

  &.thin
    margin-right: calc( -1 * min(150px, calc(300px - 20vw)))
    transform: translateX(calc(-100% + #{$nav-move}))
    transition-delay: var(--nav-trans-dur)

  &.wide:not(.thin)
    min-width: 15vw


main
  flex-grow: 1
  position: relative
  min-width: 0

@media (max-width: 900px), (max-height: 700px)
  #app
    padding: 1em

  aside:not(.thin)
    margin-right: 1em

</style>

<style lang="sass">
*
  box-sizing: border-box
  padding: 0
  margin: 0

body
  font-family: Arial, 'Nimbus Sans', sans-serif
  background: radial-gradient(at top left, $navy-grey ,$light-navy)
  background-attachment: fixed
  background-repeat: no-repeat
  margin: 0
  overflow: auto
  &::-webkit-scrollbar
      width: $gap / 2
  &::-webkit-scrollbar-thumb
    background: $washed-purple
    background: linear-gradient(to top,  $washed-purple, mix($washed-purple, $navy-grey, 60%))
  &::-webkit-scrollbar-track
    background-color: $navy-grey
  &::-webkit-scrollbar-corner
    background-color: $navy-grey

// TODO: results loading animation
// aside:not(.run)
//   --nav-trans-dur: 0.2s !important
//   transition-delay: 0s !important
//   svg
//     transition-delay: 0s !important

input, textarea, button
  font-family: inherit

button, a, input[type="checkbox"], input[type="radio"]
  cursor: pointer

button, a, input
  font-size: inherit
  background: transparent
  color: inherit
  border: 0
  outline: 0
  text-align: left
  text-decoration: none
  -webkit-appearance: none

input[type="checkbox"], input[type="radio"]
  display: none

button:disabled
  cursor: not-allowed

.CodeMirror, .CodeMirror-gutters
  font-size: 1.5rem
  background: transparent !important
  color: white
  height: auto !important

// if no theme loaded
.CodeMirror
  color: white !important

.CodeMirror pre.CodeMirror-line
  color: white !important


.CodeMirror-linenumber
  width: 1rem !important

span.cm-comment, .cm-s-Base2Tone-Suburb-dark span.cm-bracket
  color: #aaa !important

.cm-error:not(.mark)
  background-color: transparent !important
</style>
