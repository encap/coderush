<template>
  <div>
    <h1>{{ format(WPM, 0, 1) }} WPM = {{ format(CPM, 0, 1) }} CPM</h1>
    <h2>{{ stats.codeLength }} correct in {{ format(stats.timeFromFirstInput, 1) }} sec</h2>
    <h3>Starting speed: {{ format(oneThirdWPM, 0, 1) }} WPM</h3>
    <h3>Final speed: {{ format(lastThirdWPM, 0, 1) }} WPM</h3>
    <h4>Start reaction time (excluded from results): {{ format(startReactionTime, 0, 1) }} ms</h4>
    <h4>Input intervals: {{ format(keyPressAvgInterval, 0, 1) }} ms</h4>
    <div v-if="mistakes.length" class="mistakes">
      <h2>Total errors: {{ mistakes.length }} / {{ stats.history.length - 1 }} ({{ format(mistakesToClicksRatio, 1, 100) }} %)</h2>
      <ul>
        <li>Time wasted by mistakes: {{ format(totalTimeLost) }} s</li>
        <li>The speed of counting down that time {{ format(WPMWithoutTimeLost, 0, 1) }} WPM</li>
        <li>Most mistakes in a row: {{ mostMistakesInARow }} znaków</li>
        <li>Longest correction time: {{ format(longestTimeOfCorrection) }} s</li>
      </ul>
    </div>
    <h2 v-else>
      You haven't made any mistakes!
    </h2>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'StatsCard',
  props: {
    stats: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      mostFrequent: [],
    };
  },
  computed: {
    ...mapGetters(['room']),
    CPM() {
      return this.stats.codeLength / this.format(this.stats.timeFromFirstInput, 4) * 60;
    },
    WPM() {
      return this.CPM / 5;
    },
    oneThirdWPM() {
      return this.stats.oneThirdCharsCount / this.format(this.stats.oneThirdTime, 4) * 60 / 5;
    },
    lastThirdTime() {
      return this.stats.timeFromFirstInput - this.stats.lastThirdStartTime;
    },
    lastThirdWPM() {
      return this.stats.lastThirdCharsCount / this.format(this.lastThirdTime, 4) * 60 / 5;
    },
    history() {
      return this.stats.history;
    },
    mistakes() {
      return this.history.filter((change) => change.type === 'mistake');
    },
    mistakesToClicksRatio() {
      return this.mistakes.length / (this.history.length - 1);
    },
    mostMistakesInARow() {
      return this.mistakes.map((obj) => obj.fixQueuePos)
        .reduce((acc, value) => Math.max(acc, value), 0);
    },
    correctionTimes() {
      const timesAcc = [];
      for (let i = 1; i < this.history.length; i += 1) {
        // / log(this.history[i]);
        if (this.history[i].type === 'mistake') {
          const startTime = this.history[i].time;
          // console.log(`StartTime ${startTime}; Expected '${this.history[i].expectedText}'`);
          // i+1 must be backspace or another mistake
          for (let j = i + 2; j < this.history.length; j += 1) {
            // console.log(`Looking for correction: ${this.history[j].type}`);
            if (this.history[j].type === 'correct') {
              // console.og(this.history[j].time - startTime);
              timesAcc.push(this.history[j].time - startTime);
              i = j;
              break;
            }
          }
        }
      }
      return timesAcc;
    },
    totalTimeLost() {
      return this.correctionTimes.reduce((acc, value) => acc + value, 0);
    },
    WPMWithoutTimeLost() {
      return this.stats.codeLength / this.format(this.stats.timeFromFirstInput - this.totalTimeLost, 4) * 60 / 5;
    },
    longestTimeOfCorrection() {
      return this.correctionTimes.reduce((acc, value) => Math.max(acc, value), 0);
    },
    startReactionTime() {
      return this.stats.firstCharTime - this.stats.startTime;
    },
    keyPressAvgInterval() {
      return this.stats.codeLength / this.stats.timeFromFirstInput;
    },
  },
  mounted() {
    if (this.room.connected) {
      this.$socket.client.emit('completedStats', {
        wpm: this.format(this.WPM, 0, 1),
        mistakesCount: this.mistakes.length,
      });
    }
  },
  methods: {
    format(number, precision = 2, scaler = 0.001) {
      return Math.round(number * scaler * (10 ** precision)) / (10 ** precision);
    },
  },
};
</script>

<style lang="sass" scoped>
table
  border-collapse: separate
  border-spacing: 2px 4px

td
  width: 100px
  text-align: center


</style>
