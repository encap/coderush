<template>
  <nav>
    <button class="title" @click="mainPage">
      Test change
      <span class="beta">BETA</span>
    </button>

    <div class="links" :class="{'room-connected': room.connected}">
      <button class="link" @click="mainPage(true)">
        <fa :icon="['fas', 'play']" :class="{flip: $route.path === '/run'}" />
        <span class="btn-text">
          Start
        </span>
      </button>
      <div class="line" />
      <button class="link language" @click="$store.commit('USER_LANGUAGE')">
        <fa v-show="userLanguage" :icon="['fas', 'globe-americas']" />
        <fa v-show="!userLanguage" :icon="['fas', 'globe-europe']" />
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
    <RoomPanel class="room" />
    <div class="author">
      <span class="author-text">
        Made with <fa :icon="['fas', 'heart']" class="heart" /> by <span class="author-name">Łukasz Wielgus</span>
      </span>
    </div>
  </nav>
</template>

<script>
import RoomPanel from '@/components/RoomPanel.vue';
import { mapGetters } from 'vuex';


export default {
  name: 'NavBar',
  components: {
    RoomPanel,
  },

  computed: {
    ...mapGetters(['room', 'language', 'userLanguage']),
  },
  methods: {
    mainPage() {
      if (this.$route.path === '/') {
        if (this.language.name && !this.room.connected) {
          this.$emit('start');
        }
      } else if (this.room.owner) {
        this.$socket.client.emit('reset');
        this.$router.push('/');
      } else {
        this.$router.push('/');
      }
    },
  },
};
</script>

<style lang="sass" scoped>
@mixin padding-left
  padding-left: 1.2rem
  padding-right: 1.2rem

.title
  // margin-top: 4% // 10-6
  font-size: 2rem
  font-weight: 600
  padding: 1.1rem 0
  width: 100%
  position: relative
  transition: opacity $nav-trans-dur $nav-trans-timing $nav-trans-dur, background-color .15s ease-in-out
  @include padding-left
  @include navbar-mouse-effect

  .beta
    font-size: 13px
    position: absolute
    padding-left: 3px

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
    @include navbar-mouse-effect

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

.author
  @include padding-left

  .author-text
    font-size: .9em

    .author-name
      white-space: nowrap

</style>
