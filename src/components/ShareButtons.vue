<template>
  <div class="container">
    <button v-if="link" @click="copyLink">
      <fa :icon="['fa', 'link']" :size="size" />
    </button>
    <input ref="linkInput" type="text" :value="link">

    <button @click="shareFacebook">
      <fa :icon="['fab', 'facebook-f']" :size="size" />
    </button>
    <button @click="shareMessenger">
      <fa :icon="['fab', 'facebook-messenger']" :size="size" />
    </button>
    <button @click="shareTwitter">
      <fa :icon="['fab', 'twitter']" :size="size" />
    </button>
  </div>
</template>

<script>
export default {
  name: 'ShareButtons',
  props: {
    size: {
      type: String,
      default: '1x',
    },
    showLink: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    link() {
      return window.location.origin;
    },
  },
  methods: {
    popUpWindow(url, w, h) {
      const left = (window.innerWidth / 2) - (w / 2);
      const top = (window.innerHeight / 2) - (h / 2);
      window.open(url, 'Share', `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${top}, left=${left}`);
    },
    shareFacebook() {
      this.popUpWindow('https://www.facebook.com/sharer/sharer.php?kid_directed_site=0&u=https%3A%2F%2Fcoderush.xyz%2F&display=popup&ref=plugin&src=share_button', 500, 600);
    },
    shareMessenger() {
      this.popUpWindow('http://www.facebook.com/dialog/send?app_id=346639949987830&link=https://coderush.xyz/&redirect_uri=https://coderush.xyz/', 1000, 700);
    },
    shareTwitter() {
      this.popUpWindow('https://twitter.com/intent/tweet?text=Check%20your%20code%20writing%20speed%20on%20CodeRush&url=https://coderush.xyz/', 600, 600);
    },
    copyLink() {
      this.$refs.linkInput.select();
      document.execCommand('copy');
      this.$emit('linkCopied');
    },

  },
};
</script>

<style lang="sass" scoped>
input
  position: absolute
  opacity: 0
  pointer-events: none
</style>
