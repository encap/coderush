<script>
import { Pie } from 'vue-chartjs';
import ChartJsPluginDataLabels from 'chartjs-plugin-datalabels';

// eslint-disable-next-line no-unused-vars
// import Chart from 'chart.js';
// import 'chartjs-plugin-labels';

export default {
  name: 'PieChart',
  components: {
    ChartJsPluginDataLabels,
  },
  extends: Pie,
  props: {
    history: {
      type: Array,
      default: null,
    },
  },
  computed: {
    chartData() {
      // split to separate for loops for better code readability
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
      const sum = correctInputTime + wrongInputTime + deletingTime;

      const format = (value) => Math.round(value / sum * 100);

      return [
        format(correctInputTime),
        format(wrongInputTime),
        format(deletingTime),
      ];
    },
    options() {
      return {
        responsive: true,
        aspectRatio: 1,
        cutoutPercentage: 45,
        events: this.chartData[2] < 5 ? ['mousemove'] : [],
        elements: {
          arc: {
            borderWidth: 30,
          },
        },
        title: {
          display: true,
          text: 'Time spent by category',
          fontSize: '16',
          textAlign: 'left',
          fontColor: '#fff',
        },
        legend: {
          display: false,
          position: 'left',
          align: 'start',
          fullWidth: false,
          labels: {
            padding: 15,
            fontColor: '#fff',
            fontSize: 13,
          },
        },
        tooltips: {
          cornerRadius: 0,
          backgroundColor: 'rgba(20,20,20, 0.5)',
          callbacks: {
            label: (item, data) => data.labels[item.index],
          },
          filter(item) {
            return item.index === 2;
          },
        },
        plugins: {
          datalabels: {
            color: '#fff',
            display: this.chartData[2] < 5 ? 'auto' : true,
            labels: {
              value: {
                font: {
                  size: 13,
                },
                formatter(value) {
                  return `${value}%`;
                },
              },
              name: {
                align: 'start',
                anchor: 'start',
                font: {
                  size: 13,
                },
                offset: 5,
                formatter(value, ctx) {
                  return ctx.chart.data.labels[ctx.dataIndex];
                },
              },
            },
          },
        },
      };
    },
    chartDatasets() {
      return {
        labels: [
          'Correct Input', 'Mistake', 'Deleting',
        ],

        datasets: [
          {
            type: 'pie',
            backgroundColor: ['#292a3e', '#c957e0', '#266eb7'],
            hoverBackgroundColor: ['#292a3e', '#c957e0', '#266eb7'],
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
