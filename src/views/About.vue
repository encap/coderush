<template>
  <div>
    <h1 class="title">
      Welcome to CodeRush
    </h1>

    <template v-if="smallScreen">
      <p class="small-screen-msg">
        Unfortunately there is not enough space on your screen to use this app.
        Please come back here later when you will have access to a larger device.
      </p>


      <nav>
        <a href="#description">
          About
        </a>
        <button class="results-btn" @click="loadExampleResults">
          {{ showResults && !resultsReady ? 'Loading...' : (resultsReady ? 'Hide Results' : 'Example Results') }}
        </button>
      </nav>
    </template>


    <section class="container">
      <main>
        <article id="description">
          <h2 v-if="smallScreen">
            Our mission
          </h2>
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
        <button class="results-btn" @click="loadExampleResults">
          {{ resultsReady ? 'Hide' : 'Load' }}{{ showResults && !resultsReady ? 'ing' : '' }} example results
        </button>
      </main>
      <aside class="stats">
        <h3>{{ languagesList.length }}</h3><p>Supported Languages and Frameworks</p>


        <h3>{{ stats.total }}</h3><p>Times Played</p>


        <h3>{{ Math.round(stats.avg * 10) / 10 }}</h3><p>Avarage Speed in WPM ({{ Math.round(stats.avg * 5) }} CPM)</p>


        <h3>{{ stats.best }}</h3><p>Best Score in WPM</p>


        <h3>{{ stats.correctLines }}</h3><p>Lines written ({{ Math.round(stats.correctLines / 50000 * 100 * 10) / 10 }}% of Vue.js source code)</p>


        <h3>{{ Math.round(stats.deletingTime / 60) }}</h3><p>Minutes Wasted by Making {{ stats.backspaceClicks }} Mistakes</p>
      </aside>
    </section>

    <div class="results-container">
      <Results
        v-if="showResults && exampleStats"
        id="example"
        :stats="exampleStats"
        class="results-component"
        @ready="onResultsReady"
      />
    </div>
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
    ...mapGetters(['smallScreen', 'languagesList']),
  },
  methods: {
    async loadExampleResults() {
      if (!this.exampleStats) {
        const response = await axios.get('/exampleResults.json');
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
        top: this.smallScreen ? window.innerHeight : window.innerHeight / 2,
        behavior: 'smooth',
      });
    },
  },

};
</script>
<style lang="sass">
@media (max-width: 800px), (max-height: 480px)
  html
    scroll-behavior: smooth

</style>
<style lang="sass" scoped>
button, nav a
  display: flex
  align-items: center
  justify-content: space-around
  height: 47px
  background: $navy-grey
  padding: 0 1em
  box-shadow: 0px 0px 2px 2px rgba(black, .05)

  &.results-btn
    background: linear-gradient(to left, $purple-gradient-colors)


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

    h2
      margin-top: 1.5em

    p
      font-size: 1rem
      line-height: 1.4
      margin: 1em 0

    a
      color: $dark-pink
      text-decoration: underline

    button
      margin-top: 3em
      width: 250px


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


@media (max-width: 800px), (max-height: 480px)
  nav
    display: flex
    justify-content: space-between
    margin: 2em 0

    a
      margin-right: 1em

    button, a
      flex-grow: 1


  .container
    flex-direction: column-reverse

    main
      flex-grow: 1
      max-width: none
      margin-right: 0

  .stats
    h3
      justify-self: center


  .results-container
    margin-top: 3em
    overflow: auto

    .results-component
      width: 190vw
</style>
