<template>
  <div>
    <div class="flex-row">
      <StatsCard :stats="stats" class="stats" />
      <LinesChart :history="stats.history" class="chart lines" />
    </div>
    <div class="flex-row">
      <PieChart :history="stats.history" class="chart pie" />
      <MixedChart :stats="stats" class="chart mixed" />
    </div>

    <VirtualKeyboard
      :history="
        stats.history"
    />
  </div>
</template>

<script>
import StatsCard from '@/components/StatsCard.vue';
import VirtualKeyboard from '@/components/VirtualKeyboard.vue';
import LinesChart from '@/components/charts/LinesChart.vue';
import PieChart from '@/components/charts/PieChart.vue';
import MixedChart from '@/components/charts/MixedChart.vue';


export default {
  name: 'Results',
  components: {
    StatsCard,
    VirtualKeyboard,
    LinesChart,
    PieChart,
    MixedChart,

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

<style lang="sass" scoped>
.stats
  min-width: 300px

.flex-row
  display: flex
  justify-content: space-between
  width: 100%
  height: 400px
  position: relative

.chart
  height: 100%
  min-width: 300px
  width: 400px
  position: relative

.lines, .mixed
  margin-left: 5vw
  flex-grow: 1

</style>
