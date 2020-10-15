<template>
  <div>
    <h1>Welcome to CodeRush</h1>

    <section class="container">
      <main>
        <article>
          <p>
            Keyboard is an essential tool for the programmer. It turns out that the most commonly used key is a backspace. Very often, mistakes are coused by miss-click or a bad typing technique. That reduces our efficiency and causes programmer to loose focus on the actual coding problem.
          </p>
          <p>
            CodeRush allows you to test your writing skills in more than 30 most popular technologies and 3 diffrent game modes. In addition to calculating your CPM (characters per minute), it provides you with detailed statistics for example the most frequently miss-clicked keys, so that You will pay attention to them in the future.
          </p>
          <p>
            On CodeRush you can create a private multiplayer server, so that you can compete with invited friends and colleagues.
          </p>
          <p>
            We do our best to ensure the diversity and quality of the code on which you will test your skills. You can <a>donate here</a> or <a @click="$router.push('/contribute')">contribute</a> if you like it.
          </p>
        </article>
        <button @click="loadExampleResults">
          {{ resultsReady ? 'Hide' : 'Load' }}{{ showResults && !resultsReady ? 'ing' : '' }} example results
        </button>
      </main>
      <aside class="stats">
        <h3>{{ languagesList.length }}</h3><p>Supported Languages and Frameworks</p>


        <h3>{{ stats.total }}</h3><p>Times Played</p>


        <h3>{{ stats.avgWPM }}</h3><p>Avarage Speed in WPM ({{ stats.avgWPM * 5 }} CPM)</p>


        <h3>{{ stats.best }}</h3><p>Best Score in WPM</p>


        <h3>{{ stats.correctLines }}</h3><p>Lines written ({{ Math.round(stats.correctLines / 50000 * 100 * 10) / 10 }}% of Vue.js source code)</p>


        <h3>{{ Math.round(stats.deletingTime / 60) }}</h3><p>Minutes Wasted by Making {{ stats.backspaceClicks }} Mistakes</p>
      </aside>
    </section>

    <Results
      v-if="showResults && exampleStats"
      :stats="exampleStats"
      @ready="onResultsReady"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import axios from 'axios';


const Results = () => import(/* webpackChunkName: "results" */ '@/views/Results.vue');

export default {
  name: 'About',
  components: {
    Results,
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
      exampleStats: null,
      showResults: false,
      resultsReady: false,
    };
  },
  computed: {
    ...mapGetters({
      stats: 'databaseStats',
    }),
    ...mapGetters(['languagesList']),
  },
  methods: {
    async loadExampleResults() {
      if (!this.exampleStats) {
        const response = await axios.get(`${process.env.VUE_APP_ASSETS_PATH || ''}/exampleResults.json`);
        this.exampleStats = response.data;
      }

      if (this.showResults) {
        window.scroll({
          top: 0,
          behavior: 'smooth',
        });

        setTimeout(() => {
          this.showResults = false;
        }, 300);


        this.resultsReady = false;
      } else {
        this.showResults = true;
      }
    },
    onResultsReady() {
      this.resultsReady = true;
      window.scroll({
        top: window.innerHeight / 2,
        behavior: 'smooth',
      });
    },
  },

};
</script>

<style lang="sass" scoped>
.container
  display: flex
  justify-content: space-between
  margin-bottom: $gap


main
  flex-grow: 0.5
  flex-shrink: 2
  max-width: min(50%, 600px)
  margin-right: 2 * $gap
  display: flex
  flex-direction: column
  justify-content: space-between

  h1
    font-size: 2rem
    margin-bottom: 1em

  p
    font-size: 16px
    line-height: 1.4
    margin: 1em 0

  a
    color: $dark-pink
    text-decoration: underline

  button
    margin-top: 3em
    text-align: center
    height: 47px
    width: 250px
    background: linear-gradient(to left, $purple-gradient-colors)

.stats
  flex-grow: 0.3
  display: grid
  row-gap: 1rem
  grid-template-columns: max-content 1fr
  align-items: center


  h3
    font-size: 2.8rem
    margin-right: 2rem
    grid-column: 1
    justify-self: end
    // color: $purple
    filter: brightness(115%)
    background: linear-gradient(135deg, $purple-gradient-colors 150%)
    -webkit-background-clip: text
    -webkit-text-fill-color: transparent


  p
    grid-column: 2
    font-size: 1.1em
</style>
