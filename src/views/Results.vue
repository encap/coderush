<template>
  <div>
    <StatsCard :stats="stats" />
    <VirtualKeyboard :history="stats.history" /></virtualkeyboard>
  </div>
</template>

<script>
import StatsCard from '@/components/StatsCard.vue';
import VirtualKeyboard from '@/components/VirtualKeyboard.vue';

export default {
  name: 'Results',
  components: {
    StatsCard,
    VirtualKeyboard,
  },
  props: {
    stats: {
      type: Object,
      required: true,
    },
  },
  beforeMount() {
    if (!this.stats.timeFromFirstInput) {
      this.$router.push('/');
    }
  },

};
</script>

<style>

</style>
