<script>
import { HorizontalBar } from 'vue-chartjs';

export default {
  name: 'BarChart',
  extends: HorizontalBar,
  props: {
    wpm: {
      type: Number,
      default: null,
    },
  },
  computed: {
    chartData() {
      // TODO Fetch data from server
      const best = 61;
      const avg = 32;

      const scores = [
        { name: 'player', value: this.wpm },
        { name: 'avg', value: avg },
        { name: 'best', value: best },
      ];
      scores.sort((a, b) => a.value - b.value);
      console.log(scores);

      const data = {};

      scores.forEach((score, index) => {
        console.green(score.name);
        data[score.name] = {};
        data[score.name].order = index;
        data[score.name].value = score.value;
      });

      if (Math.round(data.player.value) === data.avg.value || Math.round(data.player.value) === data.best.value) {
        data.barWidth = true;
      }

      console.log(data);

      return data;
    },
    options() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            stacked: false,
            ticks: {
              min: 0,
            },
          }],
          yAxes: [{
            stacked: true,
          }],
        },
      };
    },
    chartDatasets() {
      return {
        datasets: [
          {
            barPercentage: this.chartData.barWidth ? 0.75 : 0.9,
            label: 'You',
            backgroundColor: '#266eb7',
            data: [this.chartData.player.value],
            order: this.chartData.player.order,
          },
          {
            label: 'AVG',
            backgroundColor: '#292a3e',
            data: [this.chartData.avg.value],
            order: this.chartData.avg.order,
          },
          {
            label: 'Best',
            backgroundColor: '#c957e0',
            data: [this.chartData.best.value],
            order: this.chartData.best.order,
          },
        ],
      };
    },
  },
  mounted() {
    this.renderChart(this.chartDatasets, this.options);
  },
  methods: {
    format(number, precision = 2, scaler = 0.001) {
      return Math.round(number * scaler * (10 ** precision)) / (10 ** precision);
    },
  },
};
</script>

<style>

</style>
