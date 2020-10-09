<template>
  <div class="container" :class="{showAll: showAll, shrink: shrink}">
    <template v-if="showAll">
      <button>
        <fa :icon="['fab', 'facebook-f']" size="lg" />
      </button>
      <button>
        <fa :icon="['fab', 'facebook-messenger']" size="lg" />
      </button>
      <button>
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
  @include shadow(0.1)



</style>
