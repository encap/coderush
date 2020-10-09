<template>
  <div>
    <section class="container">
      <main>
        <h2>Welcome to CodeRush</h2>

        <p>
          Keyboard is an essential tool for the programmer. It turns out that the most commonly used key is a backspace. Very often, mistakes are coused by miss-click or a bad typing technique. That reduces our efficiency and causes programmer to loose focus on the actual coding problem.
        </p>
        <p>
          CodeRush allows you to test your writing skills in more than 30 most popular technologies and 3 diffrent game modes. In addition to calculating your CPM (characters per minute), it provides you with detailed statistics for example the most frequently miss-clicked keys, so that You will pay attention to them in the future.
        </p>
        <p>
          CodeRush allows you to create a multiplayer server, so that you can compete with invited friends and colleagues.
        </p>
        <p>
          We do our best to ensure the diversity and quality of the code on which you will test your skills. You can <a>donate here</a> or <a @click="$router.push('/contribute')">contribute</a> if you like it.
        </p>
      </main>
      <aside>
        <h2>Coderush statistics</h2>
        <section class="stats">
          <div class="total">
            <h3>{{ stats.total }}</h3><p>Times played</p>
          </div>
          <div class="avg">
            <h3>{{ stats.avgWPM }}</h3><p>avarage speed in WPM ({{ stats.avgWPM * 5 }} CPM)</p>
          </div>
          <div class="total">
            <h3>{{ stats.best }}</h3><p>Best score in WPM</p>
          </div>
          <div class="total">
            <h3>{{ stats.best }}</h3><p>Best score in WPM</p>
          </div>
        </section>
      </aside>
    </section>

    <Results
      v-if="exampleStats"
      :stats="exampleStats"
    />
    <button v-else @click="loadExampleResults">
      Load example results
    </button>
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
    };
  },
  computed: {
    ...mapGetters({
      stats: 'databaseStats',
    }),
  },
  methods: {
    async loadExampleResults(ev) {
      ev.target.innerText = 'Loading...';
      const response = await axios.get(`${process.env.VUE_APP_ASSETS_PATH || ''}/exampleResults.json`);
      this.exampleStats = response.data;
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
  flex-grow: 1
  flex-shrink: 2
  max-width: 50%
  margin-right: 2 * $gap

  p
    font-size: 16px
    line-height: 1.4
    margin: 1em 0

  a
    color: $light-purple
    text-decoration: underline

aside
  flex-grow: 1

button
  text-align: center
  height: 47px
  width: 250px
  background: linear-gradient(to left, $purple-gradient-colors)

</style>
