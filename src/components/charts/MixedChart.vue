<script>
import { Bar } from 'vue-chartjs';
import { mapGetters } from 'vuex';

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
    ...mapGetters(['options']),
    history() {
      return this.stats.history.filter((event) => event.text);
    },
    inputIntervalsPoints() {
      const points = [];
      for (let i = 0; i < this.history.length; i += 1) {
        points.push({
          x: this.history[i].time,
          y: i === 0 ? this.stats.firstCharTime - this.stats.startTime : this.history[i].time - this.history[i - 1].time,
          type: this.history[i].type,
        });
      }
      return points;
    },
    avgInputIntervals() {
      const avg = Math.round(this.inputIntervalsPoints.reduce((acc, point) => acc + point.y, 0) / this.inputIntervalsPoints.length);
      return [{ x: 0, y: avg }, { x: this.stats.time, y: avg }];
    },
    wpmPoints() {
      const points = this.stats.wpmOverTime.map((wpmEvent) => ({
        x: wpmEvent[0] - (this.options.liveWpmRefreshRate / 3),
        y: wpmEvent[1],
      }));
      points.unshift({
        x: 0,
        y: points[0].y,
      });
      points.push({
        x: this.stats.time,
        y: points[points.length - 1].y,
      });

      return points.filter(({ x }) => x >= 0);
    },
    chartOptions() {
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
          xAxes: [
            {
              type: 'linear',
              ticks: {
                autoSkip: true,
                autoSkipPadding: 100,
                fontColor: '#aaa',
                max: this.avgInputIntervals[this.avgInputIntervals.length - 1].x,
                callback: (time) => {
                  const seconds = Math.ceil(time / 1000);
                  const minutes = Math.floor(seconds / 60);
                  return `${minutes ? `${minutes}min` : ''} ${seconds ? `${seconds % 60}s` : '0'}`;
                },
              },
            },

          ],
          yAxes: [
            {
              id: 'wpm',
              type: 'linear',
              position: 'right',
              gridLines: {
                display: false,
              },
              ticks: {
                fontColor: '#aaa',
                min: 0,
              },
            },
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

          ],
        },
      };
    },
    pinkGradient() {
      const gradient = this.$refs.canvas
        .getContext('2d')
        .createLinearGradient(0, 0, 0, 500);
      gradient.addColorStop(0, 'rgba(201, 87, 224, 0.9)');
      gradient.addColorStop(0.3, 'rgba(201, 87, 224, 0.2)');
      gradient.addColorStop(0.9, 'rgba(201, 87, 224, 0)');

      return gradient;
    },
    grayGradient() {
      const gradient = this.$refs.canvas
        .getContext('2d')
        .createLinearGradient(0, 0, 0, 500);
      gradient.addColorStop(0, 'rgba(68, 68, 68, 1)');
      gradient.addColorStop(0.3, 'rgba(68, 68, 68, 0.3)');
      gradient.addColorStop(1, 'rgba(68, 68, 68, 0)');

      return gradient;
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
            pointBackgroundColor: '#ddd',
            pointRadius: 2,
            pointHoverRadius: 1,
            backgroundColor: this.pinkGradient,
            order: 1,
            yAxisID: 'wpm',
          },
          {
            type: 'scatter',
            label: 'Input intervals',
            data: this.inputIntervalsPoints,
            pointStyle(ctx) {
              const event = ctx.dataset.data[ctx.dataIndex];
              if (event && event.type === 'mistake') {
                return 'crossRot';
              }
              return 'circle';
            },
            pointBackgroundColor(ctx) {
              const event = ctx.dataset.data[ctx.dataIndex];
              if (event && event.type === 'mistake') {
                return '#eee';
              }
              return '#266eb7';
            },
            pointBorderColor(ctx) {
              const event = ctx.dataset.data[ctx.dataIndex];
              if (event && event.type === 'mistake') {
                return '#eee';
              }
              return 'transparent';
            },
            pointBorderWidth(ctx) {
              const event = ctx.dataset.data[ctx.dataIndex];
              if (event && event.type === 'mistake') {
                return 2;
              }
              return 0;
            },
            pointRadius(ctx) {
              const event = ctx.dataset.data[ctx.dataIndex];
              if (event && event.type === 'mistake') {
                return 5;
              }
              return 2;
            },
            pointHoverRadius(ctx) {
              const event = ctx.dataset.data[ctx.dataIndex];
              if (event && event.type === 'mistake') {
                return 5;
              }
              return 2;
            },
            pointHoverBorderWidth(ctx) {
              const event = ctx.dataset.data[ctx.dataIndex];
              if (event && event.type === 'mistake') {
                return 2;
              }
              return 0;
            },

            backgroundColor: '#266eb7',
            order: 2,
            pointHitRadius: 6,
            yAxisID: 'inputIntervals',
          },
          {
            type: 'line',
            label: 'AVG input intervals',
            data: this.avgInputIntervals,
            backgroundColor: this.grayGradient,
            borderColor: '#444',
            borderWidth: 2,
            pointRadius: 0,
            order: 3,
            yAxisID: 'inputIntervals',
          },
        ],
      };
    },
  },
  mounted() {
    this.renderChart(this.chartDatasets, this.chartOptions);
  },
  methods: {
    format(number, precision = 2, scaler = 0.001) {
      return Math.round(number * scaler * (10 ** precision)) / (10 ** precision);
    },
  },
};
</script>
