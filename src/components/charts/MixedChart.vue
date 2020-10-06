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
    history() {
      return this.stats.history.filter((event) => event.text);
    },
    inputIntervalsPoints() {
      const points = [];
      for (let i = 1; i < this.history.length; i += 1) {
        points.push({
          x: this.history[i].time,
          y: this.history[i].time - this.history[i - 1].time,
        });
      }
      return points;
    },
    avgInputIntervals() {
      const avg = Math.round(this.inputIntervalsPoints.reduce((acc, point) => acc + point.y, 0) / this.inputIntervalsPoints.length);
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

        plugins: {
          datalabels: {
            display: false,
          },
        },
        title: {
          display: true,
          text: 'Input consistency',
          fontSize: '16',
          textAlign: 'left',
          fontColor: '#fff',
        },
        legend: {
          labels: {
            fontColor: '#fff',
            fontSize: 13,
          },
        },
        tooltips: {
          cornerRadius: 0,
          backgroundColor: 'rgba(20,20,20, 0.3)',
          callbacks: {
            title: ([item]) => {
              if (item.datasetIndex !== 0) {
                const event = this.history[item.index];
                console.blue(item.index);
                console.log(event);

                const buffer = [`${event.type === 'mistake' ? 'Wrong' : 'Correct'}: ${event.text.replace(' ', 'Space')}`];
                if (event.type === 'mistake') {
                  buffer.push(`Expected: ${event.expectedText.replace(' ', 'Space')}`);
                }
                return buffer;
              }
              return null;
            },
            label: (item) => {
              if (item.datasetIndex !== 0) {
                return `Time: ${item.yLabel} ms`;
              }
              return item.yLabel;
            },
          },
        },
        scales: {
          xAxes: [{
            type: 'linear',
            ticks: {
              stepSize: 10000,
              fontColor: '#aaa',

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
                fontColor: '#aaa',
                min: 0,
                callback(value) {
                  return `${value} ms`;
                },
              },

            },
            {
              id: 'wpm',
              type: 'linear',
              position: 'right',
              ticks: {
                fontColor: '#aaa',

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
            type: 'line',
            label: 'WPM over time',
            data: this.wpmPoints,
            cubicInterpolationMode: 'default',
            borderColor: '#c957e0',
            borderWidth: 2,
            order: 1,
            yAxisID: 'wpm',
          },
          {
            type: 'scatter',
            label: 'Input intervals',
            data: this.inputIntervalsPoints,
            pointBackgroundColor: '#266eb7',
            order: 2,
            yAxisID: 'inputIntervals',
          },
          {
            type: 'line',
            label: 'AVG input intervals',
            data: this.avgInputIntervals,
            borderColor: '#444',
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            order: 3,
            yAxisID: 'inputIntervals',
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
