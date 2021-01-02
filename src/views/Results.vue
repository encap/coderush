<template>
  <div>
    <div class="stats">
      <div class="flex-column left">
        <section class="main-stats flex-item">
          <div class="text-stats">
            <div class="big-stats">
              <div class="wpm">
                <p class="unit">
                  WPM
                </p>
                <h2 class="value">
                  {{ format(WPM, 0, 1) }}
                </h2>
              </div>
              <div class="cpm">
                <p class="unit">
                  CPM
                </p>
                <h2 class="value">
                  {{ format(CPM, 0, 1) }}
                </h2>
              </div>
              <div v-if="stats.mode !== 1" class="time">
                <p class="unit">
                  Time
                </p>
                <h2 class="value">
                  {{ minutes ? `${minutes}:${('0' + seconds).slice(-2)}` : `${seconds}s` }}
                </h2>
              </div>
              <div v-else class="characters">
                <p class="unit">
                  Characters
                </p>
                <h2 class="value">
                  {{ correctInputs }}
                </h2>
              </div>
            </div>
            <div v-if="mistakes.length" class="middle">
              <div class="mistakes-info">
                <template v-if="stats.mode !== 2">
                  <p>Time wasted by mistakes: {{ format(totalTimeLost) }} s</p>
                  <p>Speed counting down that time {{ format(WPMWithoutTimeLost, 0, 1) }} WPM</p>
                  <p>Most mistakes in a row: {{ mostMistakesInARow }} mistake{{ mostMistakesInARow === 1 ? '' : 's' }}</p>
                  <p>Longest correction time: {{ format(longestTimeOfCorrection) }} s</p>
                </template>
                <template v-else>
                  <p>You made a mistake after {{ correctInputs }} correct characters</p>
                  <p>{{ stats.codeInfo.lines - stats.correctLines }} lines left</p>
                  <p>{{ percentCompleted }}% completed</p>
                </template>
              </div>
              <ShareResults class="share" />
            </div>
            <div v-else>
              <h3>
                You didn't make any mistakes!
              </h3>
              <h3>Nothing to show here.</h3>
            </div>
          </div>
          <BarChart :wpm="format(WPM, 1, 1)" class="wpm-chart" />
        </section>

        <PieChart v-if="mistakes.length > 1" :history="stats.history" class="flex-item chart pie" />
      </div>


      <div class="flex-column right">
        <LinesChart v-if="mistakes.length > 1" :history="stats.history" class="flex-item chart lines" />

        <MixedChart :stats="stats" class="flex-item chart mixed" />
      </div>
    </div>

    <VirtualKeyboard v-if="mistakes.length > 0" :history="stats.history" />
  </div>
</template>

<script>
import axios from 'axios';

import ShareResults from '@/components/ShareResults.vue';

import BarChart from '@/components/charts/BarChart.vue';
import LinesChart from '@/components/charts/LinesChart.vue';
import PieChart from '@/components/charts/PieChart.vue';
import MixedChart from '@/components/charts/MixedChart.vue';

import VirtualKeyboard from '@/components/VirtualKeyboard.vue';


export default {
  name: 'Results',
  components: {
    ShareResults,
    BarChart,
    LinesChart,
    PieChart,
    MixedChart,
    VirtualKeyboard,

  },
  props: {
    stats: {
      type: Object,
      required: true,
    },
  },
  computed: {
    history() {
      return this.stats.history;
    },
    mistakes() {
      return this.history.filter((change) => change.type === 'mistake' || change.type === 'blockedEnter');
    },
    correctInputs() {
      return this.history.reduce((acc, event) => (event.type === 'correct' ? acc + 1 : acc), 0);
    },
    minutes() {
      return Math.floor(this.stats.time / 1000 / 60);
    },
    seconds() {
      return Math.round((this.stats.time / 1000) % 60);
    },
    CPM() {
      return this.correctInputs / this.format(this.stats.time, 4) * 60;
    },
    WPM() {
      return this.CPM / 5;
    },
    percentCompleted() {
      return this.format(this.stats.correctLines / this.stats.codeInfo.lines, 1, 100);
    },
    mostMistakesInARow() {
      return this.mistakes.map((obj) => obj.fixQueuePos || 1)
        .reduce((acc, value) => Math.max(acc, value), 0);
    },
    correctionTimes() {
      const timesAcc = [];
      for (let i = 0; i < this.history.length; i += 1) {
        if (this.history[i].type === 'mistake') {
          const startTime = this.history[i].time;
          // console.log(`StartTime ${startTime}; Expected '${this.history[i].expectedText}'`);
          // i+1 must be backspace or another mistake
          for (let j = i + 1; j < this.history.length; j += 1) {
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
    WPMWithoutTimeLost() {
      return this.correctInputs / this.format(this.stats.time - this.totalTimeLost, 4) * 60 / 5;
    },
    totalTimeLost() {
      return this.correctionTimes.reduce((acc, value) => acc + value, 0);
    },
    longestTimeOfCorrection() {
      return this.correctionTimes.reduce((acc, value) => Math.max(acc, value), 0);
    },
  },
  beforeMount() {
    if (!this.stats.time) {
      this.$router.push('/');
    }
  },
  mounted() {
    this.$emit('ready');
    this.$socket.client.emit('completedStats', {
      wpm: this.format(this.WPM, 0, 1),
      minutes: this.minutes,
      seconds: this.seconds,
      correct: this.correctInputs,
    });

    // if (this.stats.codeInfo.index !== -1) {
    if (this.$route.path !== '/about' && !this.stats.codeInfo.short) {
      this.sendStats();
    }
    // }
  },
  methods: {
    format(number, precision = 2, scaler = 0.001) {
      return Math.round(number * scaler * (10 ** precision)) / (10 ** precision);
    },
    sendStats() {
      let deletingTime = 0;
      let backspaceClicks = 0;
      for (let i = 0; i < this.history.length; i += 1) {
        if (this.history[i].type === 'backspace') {
          const startTime = this.history[i].time;
          backspaceClicks += 1;
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
      const data = {
        main: {
          languageIndex: this.stats.codeInfo.language.index,
          languageName: this.stats.codeInfo.language.name,
          fileIndex: this.stats.codeInfo.fileIndex,
          wpm: this.format(this.WPM, 0, 1),
          percentCompleted: this.percentCompleted,
        },
        misc: {
          correctClicks: this.correctInputs,
          correctLines: this.stats.correctLines,
          backspaceClicks,
          deletingTime: this.format(deletingTime, 0),
        },
      };
      const url = `${process.env.VUE_APP_API_URL}/stats`;
      axios.post(url, data)
        .then(() => {
          // console.log('Stats sent');
        })
        .catch((err) => {
          console.error('Sending stats failed');
          console.error(err.response);
        });
    },
  },

};
</script>

<style lang="sass" scoped>
.stats
  display: flex
  justify-content: space-between
  position: relative
  width: 100%
  max-width: 100%

  .flex-column
    display: flex
    justify-content: flex-start
    flex-direction: column
    position: relative
    width: 500px
    min-width: 300px

    &.left
      flex-shrink: 2

    &.right
      flex-grow: 1
      margin-left: 4vw

.flex-item
  position: relative
  margin-bottom: 3 * $gap
  width: 100%
  height: 500px
  max-height: 500px
  min-width: 100%
  min-height: 300px

.lines, .mixed
  width: 100%


.main-stats
  display: flex
  justify-content: space-between
  flex-direction: column
  font-size: calc(0.4vw + 7px)

  .big-stats
    display: flex
    justify-content: space-between
    font-size: 3em
    margin-bottom: 0.7em
    text-align: center
    width: 100%


    .unit
      font-size: .5em


  .middle
    display: flex
    align-items: stretch
    justify-content: space-between
    position: relative
    height: 7em
    .mistakes-info
      display: flex
      justify-content: space-between
      flex-direction: column
      font-size: 1.2em

    .share
      width: 7em
      height: 100%

  .wpm-chart
    flex-grow: 1
    margin-bottom: 0.3rem
    width: 100%
    height: 100%
    max-height: 200px

@media (max-width: 800px), (max-height: 480px)
  .main-stats
    font-size: 0.8rem
</style>
