<template>
  <div id="app" ref="app">
    <template v-if="!tooSmall">
      <aside ref="navLeft" class="nav-left" :class="{thin: isPlaying, wide: room.connected }">
        <NavBar :class="[{thin: isPlaying }]" />
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
import NavBar from '@/components//NavBar.vue';
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
            // console.log(element.tagName, element.className);
            const pos = element.getBoundingClientRect();
            const x = ev.pageX - pos.left;
            const y = ev.pageY - pos.top;
            element.style.setProperty('--mouse-x', `${x}px`);
            element.style.setProperty('--mouse-y', `${y}px`);
          });
        });
      }
    },
  },
};
</script>

<style lang="sass">
*
  box-sizing: border-box
  margin: 0
  padding: 0


body
  font-family: sans-serif

#app
  position: relative
  width: 100%
  min-height: 100vh
  color: $white
  padding: $gap
  background: radial-gradient(at top left, $navy-grey ,$light-navy)
  display: flex
  justify-content: space-between

aside
  min-width: $nav-size
  margin-right: $gap * 2
  padding: $grid-gap
  flex-shrink: 0
  background: transparent radial-gradient(250px at var(--mouse-x) var(--mouse-y), rgba($white, 0.2) 10%, transparent 90%) no-repeat 0 0
  @include shadow()
  transition: transform $nav-trans-dur $nav-trans-timing 0s, min-width .5s ease-in-out

  &.wide:not(.thin)
    min-width: 22vw

  &.thin
    transition-delay: $nav-trans-dur
    transform: translateX(calc(-100% + #{$nav-move}))
    margin-right: calc( -1 * min(150px, calc(300px - 20vw)))


main
  flex-grow: 1
  position: relative

button, a, input[type="checkbox"], input[type="radio"]
  cursor: pointer

option
  color: purple
  background: none

.CodeMirror, .CodeMirror-gutters
  font-size: 1.5rem
  height: auto !important
  color: white
  background: transparent !important

  // if no theme loaded
.CodeMirror
  color: white !important

.CodeMirror pre.CodeMirror-line
  color: white !important


.CodeMirror-linenumber
  width: 1rem !important


.cm-error:not(.mark)
  background-color: transparent !important

@media (max-width: 900px), (max-height: 700px)
  .toggles
    label
      margin-top: 1em
  .list
    margin-bottom: 1em

  #app
    padding: 1em

  aside:not(.thin)
    margin-right: 1em

</style>
