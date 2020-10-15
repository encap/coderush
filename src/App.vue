<template>
  <div id="app" ref="app">
    <template v-if="!tooSmall">
      <aside ref="navLeft" class="nav-left" :class="{thin: isPlaying, wide: room.connected }">
        <NavBar :class="[{thin: isPlaying }]" @start="$children[1].run()" />
      </aside>
      <main>
        <keep-alive :exclude="['Run', 'Results']">
          <router-view />
        </keep-alive>
      </main>
    </template>
    <SmallScreen v-else />
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import SmallScreen from '@/views/SmallScreen.vue';
import { mapGetters } from 'vuex';

export default {
  components: {
    NavBar,
    SmallScreen,
  },
  computed: {
    ...mapGetters(['room', 'trackedContainers']),
    tooSmall() {
      return window.innerWidth < 640 || window.innerHeight < 480;
      // return false; // DEV
    },
    isPlaying() {
      return this.$route.path === '/run';
    },
  },
  created() {
    this.$store.dispatch('loadLanguagesList');
  },
  mounted() {
    if (window.innerWidth > 1300) {
      document.addEventListener('mousemove', this.trackMouse);
      this.$store.commit('ADD_TRACKED_CONTAINER', this.$refs.navLeft);
    }
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
  color: $white
  padding: $gap
  width: 100%
  min-height: 100vh

aside
  @include cursor-shadow()
  @include shadow()
  flex-shrink: 0
  padding: $grid-gap
  margin-right: $gap * 2
  min-width: $nav-size
  transition: transform $nav-trans-dur $nav-trans-timing 0s, min-width .5s ease-in-out


  &.wide:not(.thin)
    min-width: 15vw

  &.thin
    margin-right: calc( -1 * min(150px, calc(300px - 20vw)))
    transform: translateX(calc(-100% + #{$nav-move}))
    transition-delay: $nav-trans-dur


main
  flex-grow: 1
  position: relative
  min-width: 0
  // overflow-x: hidden

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
    background: linear-gradient(to top,  $washed-purple, mix($washed-purple, $grid-color, 60%))
  &::-webkit-scrollbar-track
    background-color: $grid-color
  &::-webkit-scrollbar-corner
    background-color: $grid-color

input, textarea, button
  font-family: inherit


button, a, input[type="checkbox"], input[type="radio"]
  cursor: pointer

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


.cm-error:not(.mark)
  background-color: transparent !important
</style>
