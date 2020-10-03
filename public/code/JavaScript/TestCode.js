import NavBar from '@/components/NavBar.vue';
import SmallScreen from '@/views/SmallScreen.vue';
import { mapGetters } from 'vuex';

export default {
  components: {
    NavBar,
    SmallScreen,
  },
  computed: {
    ...mapGetters(['room', 'trackedContainers']),
    tooSmall() {
      // return window.innerWidth < 640 || window.innerHeight < 480;
      return false; // DEV
    },
    isPlaying() {
      return this.$route.path === '/run';
    },
  },
  created() {
    this.$store.dispatch('loadLanguagesList');
  },
  mounted() {
    if (window.innerWidth > 1300) {
      document.addEventListener('mousemove', this.trackMouse);
      this.$store.commit('ADD_TRACKED_CONTAINER', this.$refs.navLeft);
    }
  },
}