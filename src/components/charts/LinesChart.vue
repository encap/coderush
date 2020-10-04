<script>
import { Line } from 'vue-chartjs';

export default {
  name: 'LinesChart',
  extends: Line,
  props: {
    history: {
      type: Array,
      default: null,
    },
  },
  computed: {
    mistakes() {
      return this.history.filter((event) => event.type === 'mistake');
    },
    mistakesPoints() {
      const data = this.mistakes.reduce((acc, mistake) => {
        acc.total += 1;
        acc.points.push({ x: mistake.time, y: acc.total });

        return acc;
      }, {
        total: 0,
        points: [{ x: 0, y: 0 }],
      });
      return data.points;
    },
    timePoints() {
      const acc = {
        totalTime: 0,
        points: [{ x: 0, y: 0 }],
      };
      for (let i = 0; i < this.history.length; i += 1) {
        if (this.history[i].type === 'mistake') {
          const startTime = this.history[i].time;

          // i+1 must be backspace or another mistake
          for (let j = i + 1; j < this.history.length; j += 1) {
            // console.log(`Looking for correction: ${this.history[j].type}`);
            if (this.history[j].type === 'correct') {
              const endTime = this.history[j].time;
              // console.og(this.history[j].time - startTime);
              const time = endTime - startTime;
              acc.totalTime += time;
              acc.points.push({ x: endTime, y: acc.totalTime });
              i = j;
              break;
            }
          }
        }
      }
      return acc.points;
    },
    options() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: true,
          text: 'Time wasted by mistakes',
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
        scales: {
          xAxes: [{
            type: 'linear',
            ticks: {
              stepSize: 10000,
              max: this.timePoints[this.timePoints.length - 1].x,
              callback: (time) => {
                const seconds = Math.ceil(time / 1000);
                const minutes = Math.floor(seconds / 60);
                return `${minutes ? `${minutes}min` : ''} ${seconds ? `${seconds % 60}s` : '0'}`;
              },
            },
          }],
          yAxes: [
            {
              id: 'time',
              type: 'linear',
              position: 'left',
              ticks: {
                stepSize: 1000,
                callback: (time) => {
                  const seconds = Math.ceil(time / 1000);
                  const minutes = Math.floor(seconds / 60);
                  return `${minutes ? `${minutes}min` : ''} ${seconds ? `${seconds % 60}s` : '0'}`;
                },
              },
            },
            {
              id: 'mistakes',
              type: 'linear',
              position: 'right',
              ticks: {
                max: this.mistakes.length * 2 || 0,
                callback: (value) => (value <= this.mistakes.length + 1 ? value : ''),
              },
            },

          ],
        },
      };
    },
    chartData() {
      return {
        datasets: [
          {
            type: 'line',
            label: '# of mistakes',
            data: this.mistakesPoints,
            borderColor: '#c957e0',
            borderWidth: 2,
            steppedLine: true,
            order: 1,
            yAxisID: 'mistakes',
          },
          {
            type: 'line',
            label: 'Time wasted',
            data: this.timePoints,
            borderColor: '#266eb7',
            borderWidth: 2,
            cubicInterpolationMode: 'monotone',
            order: 2,
            yAxisID: 'time',
          },
        ],
      };
    },
  },
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
};
</script>

<style>

</style>
