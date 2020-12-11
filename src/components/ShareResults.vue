<template>
  <div class="container" :class="{showAll: showAll, shrink: shrink}">
    <ShareButtons
      ref="ShareButtons"
      size="lg"
      :show-link="false"
      class="share-buttons"
    />
    <label class="results-share-button">
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
import ShareButtons from '@/components/ShareButtons.vue';

export default {
  name: 'ShareResults',
  components: {
    ShareButtons,
  },
  data() {
    return {
      showAll: false,
      shrink: false,
    };
  },
  mounted() {
    // an ugly subsitution for fragment components which don't exist in Vue yet
    Array.from(this.$refs.ShareButtons.$el.children)
      .forEach((child) => {
        child.classList.add('results-share-button');
        this.$el.appendChild(child);
      });
    const el = this.$refs.ShareButtons.$el;
    el.parentNode.removeChild(el);
  },
  methods: {
    async animate() {
      this.shrink = true;
      await new Promise((r) => setTimeout(r, 150));
      this.showAll = !this.showAll;
      this.shrink = false;
    },
  },
};
</script>

<style lang="sass" scoped>
.container
  display: grid
  transition: transform 0.15s ease-in-out
  gap: 2*$thin-gap

  label
    width: 100%
    height: 100%

  &.showAll
    grid-template-rows: 1fr 1fr
    grid-template-columns: 1fr 1fr

    label
      width: auto
      height: auto

  &.shrink
    transform: scale(0.3)

</style>

<style lang="sass">
// can't be in scope becouse of vue attributes selector
.showAll .results-share-button
  display: flex
  @include shadow(0.2)

.results-share-button
  @include shadow(0.1)
  display: flex
  align-items: center
  justify-content: space-around
  position: relative
  background: $navy-grey
  z-index: 2

  &:hover:before
    opacity: 1

  &:before
    content: ""
    position: absolute
    top: 0
    bottom: 0
    left: 0
    right: 0
    background: linear-gradient(to bottom, $purple-gradient-colors 150%)
    opacity: 0
    transition: opacity 0.15s ease-in-out
    z-index: -1

button.results-share-button
  display: none
</style>
