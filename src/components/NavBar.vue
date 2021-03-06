<template>
  <nav>
    <button class="title" @click="mainPage">
      CodeRush
      <span class="beta" />
    </button>
    <div class="sticky-container">
      <div class="links" :class="{'room-connected': room.connected}">
        <button class="link" @click="mainPage(true)">
          <fa :icon="['fas', $route.path === '/' ? 'play' : 'home']" />
          <span class="btn-text">
            Start
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
        <div class="line" />
        <button class="link" :disabled="thin" @click="toggleShare">
          <fa :icon="['fas', showShareOptions ? 'times' : 'share-alt']" />

          <span class="btn-text">
            <ShareButtons v-if="showShareOptions" class="share-buttons" @linkCopied="showCopyConfirmation = true" />

            <template v-else> {{ showCopyConfirmation ? 'Link copied' : 'Share' }}</template>
          </span>
        </button>
      </div>
      <RoomPanel class="room" />
    </div>
    <div class="author">
      <div v-if="$route.path !== '/run' && $route.path !== '/'" class="donate">
        <a href="https://paypal.me/encap" target="_blank">Donate</a><span> if you like it</span>
      </div>
      <span class="author-text">
        Made with <fa :icon="['fas', 'heart']" class="heart" /> by <span class="author-name">Łukasz Wielgus</span>
      </span>
    </div>
  </nav>
</template>

<script>
import ShareButtons from '@/components/ShareButtons.vue';
import RoomPanel from '@/components/RoomPanel.vue';

import { mapGetters } from 'vuex';

export default {
  name: 'NavBar',
  components: {
    RoomPanel,
    ShareButtons,
  },
  props: {
    thin: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showShareOptions: false,
      showCopyConfirmation: false,
    };
  },
  computed: {
    ...mapGetters(['room', 'language']),
  },
  watch: {
    showCopyConfirmation(current) {
      if (current) {
        setTimeout(() => {
          this.showCopyConfirmation = false;
        }, 5000);
      }
    },
  },
  methods: {
    mainPage(action = false) {
      if (this.$route.path === '/') {
        if (action && this.language.name) {
          this.$emit('start');
        }
      } else {
        this.$router.push('/');
      }
    },
    toggleShare() {
      this.showShareOptions = !this.showShareOptions;
    },
  },
};
</script>

<style lang="sass" scoped>
@mixin padding-left
  padding-left: 1.2rem
  padding-right: 1.2rem

.title
  @include padding-left
  @include navbar-mouse-effect
  position: relative
  font-size: 2rem
  font-weight: 600
  padding-top: 1.1rem
  padding-bottom: 1.1rem
  width: 100%
  transition: opacity var(--nav-trans-dur) $nav-trans-timing var(--nav-trans-dur), background-color .15s ease-in-out

  .beta
    position: absolute
    font-size: 13px
    padding-left: 3px

nav
  display: flex
  flex-direction: column
  position: relative
  font-size: 1rem
  background: linear-gradient(340deg, $navy-grey, $navy-grey 20%, $washed-purple)
  padding: 6% 0
  height: 100%

nav:after
  @include pos0
  content: ''
  position: absolute
  transition: backdrop-filter var(--nav-trans-dur) $nav-trans-timing 0s
  pointer-events: none

.thin nav
  $translate: translateX(calc(#{$nav-size} - 2.5em - #{$nav-move} / 2))
  .btn-text, .title, .room
    opacity: 0
    transition-delay: 0s
  svg:not(.heart)
    transform: $translate
    transition-delay: var(--nav-trans-dur)
  .flip
    transform: $translate rotate(180deg) !important
  .author
    opacity: 0
    transition-delay: var(--nav-trans-dur)

.run.thin nav:after
  transition-delay: 1s
  backdrop-filter: hue-rotate(10deg) brightness(80%)

.btn-text, .room, .author
  transition: opacity var(--nav-trans-dur) $nav-trans-timing var(--nav-trans-dur)

.sticky-container
  display: flex
  flex-direction: column
  height: 100%
  max-height: 90vh
  position: sticky
  top: 0
  padding-bottom: 2em
  z-index: 10

.links
  margin: 6% 0 10% 0
  $line: 1px solid $grey
  border-top: $line
  border-bottom: $line
  min-height: 20em
  display: flex
  flex-direction: column
  justify-content: space-evenly
  transition: min-height .5s ease-in-out

  .link
    @include padding-left
    @include navbar-mouse-effect
    display: block
    padding-top: 1.1rem
    padding-bottom: 1.1rem
    width: 100%

  .line
    width: 100%

  .btn-text
    margin-left: 1em

  &.room-connected
    min-height: 15em

svg
  display: inline-block
  width: 1em !important
  transition: transform var(--nav-trans-dur) $nav-trans-timing 0s

.share-buttons
  display: inline-flex

  &::v-deep
    button
      display: inline-block
      margin: 0 0.5em

.room
  @include padding-left
  flex-grow: 1
  position: relative

.author
  @include padding-left
  margin-top: auto

  .donate
    margin: 1em 0

    a
      text-decoration: underline

  .author-text, .donate
    font-size: .9em

    .author-name
      white-space: nowrap


</style>
