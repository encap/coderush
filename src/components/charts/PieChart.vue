<script>
import { Pie } from 'vue-chartjs';

export default {
  name: 'PieChart',
  extends: Pie,
  props: {
    history: {
      type: Array,
      default: null,
    },
  },
  computed: {
    chartData() {
      let correctInputTime = 0;
      for (let i = 0; i < this.history.length; i += 1) {
        if (this.history[i].type === 'correct') {
          const startTime = this.history[i].time;
          for (let j = i + 1; j < this.history.length; j += 1) {
            if (this.history[j].type !== 'correct') {
              const endTime = this.history[j].time;
              const time = endTime - startTime;
              correctInputTime += time;
              i = j;
              break;
            }
          }
        }
      }

      let wrongInputTime = 0;
      for (let i = 0; i < this.history.length; i += 1) {
        if (this.history[i].type !== 'correct' && this.history[i].type !== 'backspace') {
          const startTime = this.history[i].time;
          for (let j = i + 1; j < this.history.length; j += 1) {
            if (this.history[j].type === 'correct') {
              const endTime = this.history[j].time;
              const time = endTime - startTime;
              wrongInputTime += time;
              i = j;
              break;
            }
          }
        }
      }

      let deletingTime = 0;
      for (let i = 0; i < this.history.length; i += 1) {
        if (this.history[i].type === 'backspace') {
          const startTime = this.history[i].time;
          for (let j = i + 1; j < this.history.length; j += 1) {
            if (this.history[j].type !== 'backspace') {
              const endTime = this.history[j].time;
              const time = endTime - startTime;
              deletingTime += time;
              i = j;
              break;
            }
          }
        }
      }
      return [correctInputTime, wrongInputTime, deletingTime];
    },
    options() {
      return {
        responsive: true,
        aspectRatio: 1,
        maintainAspectRatio: false,
        cutoutPercentage: 40,

      };
    },
    chartDatasets() {
      return {
        datasets: [
          {
            type: 'pie',
            label: 'Time spent by category',
            labels: [
              'Correct Input', 'Wrong Input', 'Deleting',
            ],
            backgroundColor: ['#292a3e', '#c957e0', '#266eb7'],
            data: this.chartData,
            borderColor: '#222',
            borderWidth: 1,
          },
        ],
      };
    },
  },
  mounted() {
    this.renderChart(this.chartDatasets, this.options);
  },
};
</script>

<style>

</style>
