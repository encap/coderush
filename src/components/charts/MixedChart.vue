<script>
import { Bar } from 'vue-chartjs';

export default {
  name: 'MixedChart',
  extends: Bar,
  props: {
    stats: {
      type: Object,
      default: null,
    },
  },
  computed: {
    inputIntervalsPoints() {
      const history = this.stats.history;

      const points = [];
      for (let i = 0; i < history.length - 1; i += 2) {
        points.push({
          x: history[i].time,
          y: history[i + 1].time - history[i].time,
        });
      }
      return points;
    },
    avgInputIntervals() {
      const avg = this.inputIntervalsPoints.reduce((acc, point) => acc + point.y, 0) / this.inputIntervalsPoints.length;
      return [{ x: 0, y: avg }, { x: this.stats.timeFromFirstInput, y: avg }];
    },
    wpmPoints() {
      const oneThirdTime = this.format(this.stats.oneThirdTime, 0);
      const oneThirdWPM = this.stats.oneThirdCharsCount / oneThirdTime * 60 / 5;

      const halfCharsCount = this.stats.codeLength - this.stats.oneThirdCharsCount - this.stats.lastThirdCharsCount;
      const halfTime = this.format(this.stats.lastThirdStartTime - this.stats.oneThirdTime, 0);
      const halfWPM = halfCharsCount / halfTime * 60 / 5;

      const lastThirdTime = this.format(this.stats.timeFromFirstInput - this.stats.lastThirdStartTime, 0);
      const lastThirdWPM = this.stats.lastThirdCharsCount / lastThirdTime * 60 / 5;

      return [
        { x: 0, y: this.format(oneThirdWPM, 1, 1) },
        { x: this.format(this.stats.timeFromFirstInput / 2, 0, 1), y: this.format(halfWPM, 1, 1) },
        { x: this.stats.timeFromFirstInput, y: this.format(lastThirdWPM, 1, 1) },
      ];
    },
    options() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            type: 'linear',
            ticks: {
              stepSize: 10000,
              max: this.avgInputIntervals[this.avgInputIntervals.length - 1].x,
              callback: (time) => {
                const seconds = Math.ceil(time / 1000);
                const minutes = Math.floor(seconds / 60);
                return `${minutes ? `${minutes}min` : ''} ${seconds ? `${seconds % 60}s` : '0'}`;
              },
            },
          }],
          yAxes: [
            {
              id: 'inputIntervals',
              type: 'linear',
              position: 'left',
              ticks: {
                min: 0,
              },
            },
            {
              id: 'wpm',
              type: 'linear',
              position: 'right',
              ticks: {
                min: 0,
              },
            },
          ],
        },
      };
    },
    chartDatasets() {
      return {
        datasets: [
          {
            type: 'scatter',
            label: 'Input intervals',
            data: this.inputIntervalsPoints,
            pointBackgroundColor: '#266eb7',
            order: 3,
            yAxisID: 'inputIntervals',
          },
          {
            type: 'line',
            label: 'AVG input intervals',
            data: this.avgInputIntervals,
            borderColor: 'light-grey',
            borderWidth: 1,
            pointBorderColor: 'transparent',
            order: 2,
            yAxisID: 'inputIntervals',
          },
          {
            type: 'line',
            label: 'WPM over time',
            data: this.wpmPoints,
            cubicInterpolationMode: 'default',
            borderColor: '#c957e0',
            borderWidth: 1,
            order: 3,
            yAxisID: 'wpm',
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
