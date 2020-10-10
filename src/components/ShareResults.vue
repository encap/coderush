<template>
  <div class="container" :class="{showAll: showAll, shrink: shrink}">
    <template v-if="showAll">
      <button @click="shareFacebook">
        <fa :icon="['fab', 'facebook-f']" size="lg" />
      </button>
      <button @click="shareMessenger">
        <fa :icon="['fab', 'facebook-messenger']" size="lg" />
      </button>
      <button @click="shareTwitter">
        <fa :icon="['fab', 'twitter']" size="lg" />
      </button>
    </template>
    <label>
      <fa :icon="['fas', showAll ? 'times' : 'share-alt']" size="lg" />
      <input
        :disabled="$route.path === '/about'"
        type="checkbox"
        @change="animate"
      >
    </label>
  </div>
</template>

<script>
export default {
  name: 'ShareResults',
  data() {
    return {
      showAll: false,
      shrink: false,
    };
  },
  methods: {
    async animate() {
      this.shrink = true;
      await new Promise((r) => setTimeout(r, 150));
      this.showAll = !this.showAll;
      this.shrink = false;
    },
    popUpWindow(url, w, h) {
      const left = (window.innerWidth / 2) - (w / 2);
      const top = (window.innerHeight / 2) - (h / 2);
      window.open(url, 'Share', `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${top}, left=${left}`);
    },
    shareFacebook() {
      this.popUpWindow('https://www.facebook.com/sharer/sharer.php?kid_directed_site=0&u=https%3A%2F%2Fcoderush.herokuapp.com%2F&display=popup&ref=plugin&src=share_button', 500, 600);
    },
    shareMessenger() {
      this.popUpWindow('http://www.facebook.com/dialog/send?app_id=346639949987830&link=https://coderush.herokuapp.com/&redirect_uri=https://coderush.herokuapp.com/', 1000, 700);
    },
    shareTwitter() {
      this.popUpWindow('https://twitter.com/intent/tweet?text=Check%20your%20code%20writing%20speed%20on%20CodeRush&url=https://coderush.herokuapp.com/', 600, 600);
    },

  },
};
</script>

<style lang="sass" scoped>
.container
  display: grid
  gap: 2*$grid-gap
  transition: transform 0.15s ease-in-out

  label
    height: 100%
    width: 100%

  &.showAll
    grid-template-columns: 1fr 1fr
    grid-template-rows: 1fr 1fr

    button,label
      @include shadow(0.2)

    label
      height: auto
      width: auto

  &.shrink
    transform: scale(0.3)

button, label
  background: $grid-color
  display: flex
  justify-content: space-around
  align-items: center
  position: relative
  z-index: 2
  @include shadow(0.1)

  &:hover:before
    opacity: 1

  &:before
    position: absolute
    content: ""
    top: 0
    right: 0
    bottom: 0
    left: 0
    background: linear-gradient(to bottom, $purple-gradient-colors 150%)
    z-index: -1
    transition: opacity 0.15s ease-in-out
    opacity: 0



</style>
