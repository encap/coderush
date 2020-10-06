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
    mistakesPoints() {
      const data = this.mistakes.reduce((acc, mistake) => {
        acc.total += 1;
        console.blue(mistake.time);

        acc.points.push({ x: mistake.time, y: acc.total });

        return acc;
      }, {
        total: 0,
        points: [{ x: 0, y: 0 }],
      });
      console.log(data.points.length);

      // data.points.push(data.points[data.points.length - 1]);
      // console.log(data.points.length);

      data.points.push({
        x: this.timePoints[this.timePoints.length - 1].x,
        y: data.total,
      });
      console.log(data.points);
      return data.points;
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
        tooltips: {
          cornerRadius: 0,
          backgroundColor: 'rgba(20,20,20, 0.3)',
          callbacks: {
            title: ([item]) => {
              if (item.index && item.index <= this.mistakes.length) {
                const event = this.mistakes[item.index - 1];
                return [
                  `Wrong: ${event.text.replace(' ', 'Space')}`,
                  `Expected: ${event.expectedText.replace(' ', 'Space')}`,
                ];
              }
              return null;
            },
          },
        },
        plugins: {
          datalabels: {
            display: false,
          },
        },
        scales: {
          xAxes: [{
            type: 'linear',
            gridLines: {

            },
            ticks: {
              fontColor: '#aaa',

              stepSize: 10000,
              max: this.timePoints[this.timePoints.length - 1].x,
              callback: (time) => {
                const seconds = Math.ceil(time / 1000);
                const minutes = Math.floor(seconds / 60);
                return `${minutes ? `${minutes} min` : ''} ${seconds ? `${seconds % 60} s` : '0'}`;
              },
            },
          }],
          yAxes: [
            {
              id: 'time',
              type: 'linear',
              position: 'left',
              gridLines: {
                display: false,
              },
              ticks: {
                fontColor: '#aaa',
                stepSize: 1000,
                callback: (time) => {
                  const seconds = Math.ceil(time / 1000);
                  const minutes = Math.floor(seconds / 60);
                  return `${minutes ? `${minutes} min` : ''} ${seconds ? `${seconds % 60} s` : '0'}`;
                },
              },
            },
            {
              id: 'mistakes',
              type: 'linear',
              position: 'right',
              ticks: {
                fontColor: '#aaa',

                max: this.mistakes.length * 2 || 0,
                callback: (value) => (value <= this.mistakes.length + 1 ? value : ''),
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
      gradient.addColorStop(0, 'rgba(201, 87, 224, 1)');
      gradient.addColorStop(0.3, 'rgba(201, 87, 224, 0.4)');
      gradient.addColorStop(0.95, 'rgba(201, 87, 224, 0)');

      return gradient;
    },
    blueGradient() {
      const gradient = this.$refs.canvas
        .getContext('2d')
        .createLinearGradient(0, 0, 0, 500);
      gradient.addColorStop(0, 'rgba(38, 110, 183, 1)');
      gradient.addColorStop(0.2, 'rgba(38, 110, 183, 0.4)');
      gradient.addColorStop(0.7, 'rgba(38, 110, 183, 0)');

      return gradient;
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
            backgroundColor: this.pinkGradient,
            steppedLine: true,
            order: 1,
            pointBackgroundColor: '#ddd',
            pointBorderColor: '#ddd',
            pointStyle: 'crossRot',
            yAxisID: 'mistakes',
            pointRadius({ dataIndex, dataset }) {
              if (dataIndex === dataset.data.length - 1) {
                return 0;
              }
              return 5;
            },
          },
          {
            type: 'line',
            label: 'Time wasted',
            data: this.timePoints,
            borderColor: '#266eb7',
            borderWidth: 2,
            backgroundColor: this.blueGradient,
            cubicInterpolationMode: 'monotone',
            order: 2,
            pointBackgroundColor: '#ddd',
            pointBorderColor: '#ddd',
            pointStyle: 'crossRot',
            pointRadius: 5,
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
