<template>
  <div class="wrapper">
    <div class="warning">
      <span v-if="!language.index">
        Choose language <fa class="arrow" :icon="['fas', 'play']" />
      </span>
    </div>
    <div class="settings">
      <div class="tab-settings">
        <span class="tab-text">Tab size:</span>

        <label
          v-for="(size) in tabSizes"
          :key="size"
          :class="{'selected': size === selectedSize}"
          class="tab-size-option"
        >
          <span>{{ size }}</span>
          <input
            v-model="selectedSize"
            :value="size"
            type="radio"
          >
        </label>
      </div>
      <p v-show="language.index && !editorReady ">
        Loading...
      </p>
    </div>
    <codemirror
      ref="codemirror"
      v-model="code"
      class="codemirror"
      :class="{ready: editorReady}"
      :options="cmOptions"
      @ready="onCmReady"
      @input="useCustomCode"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
// import { loadMode, loadTheme } from '@/cmLoader';
// import { codemirror } from 'vue-codemirror';

// const { codemirror } = () => import(/* webpackChunkName: "vueCodeMirror" */ 'vue-codemirror');
// import codemirror from 'vue-codemirror/src/codemirror.vue';
// const codemirror = () => import(/* webpackChunkName: "codemirror" */ 'vue-codemirror/src/codemirror.vue');
let loadMode; let
  loadTheme;
const codemirror = () => import(/* webpackChunkName: "cmLoader" */ '@/cmLoader.js').then((module) => {
  loadMode = module.loadMode;
  loadTheme = module.loadTheme;
  return module.default;
});


export default {
  name: 'UploadCode',
  components: {
    codemirror,
  },
  data() {
    return {
      code: '',
      timeout: 0,
      editorReady: false,
      tabSizes: [2, 4, 8],
      selectedSize: 2,
    };
  },
  computed: {
    ...mapGetters(['language']),
    cmOptions() {
      return {
        tabSize: this.selectedSize,
        lineNumbers: true,
        mathBrackets: true,
        styleSelectedText: true,
        styleActiveLine: false,
        lineWrapping: true,
        theme: 'material-darker',
        viewportMargin: Infinity,
      };
    },
    numberOfLines() {
      return this.code.split(/\r\n|\r|\n/).length;
    },
  },
  watch: {
    async language() {
      this.editorReady = false;
      await loadMode(this.cm, this.language.mode);
      console.green('watch');
      this.editorReady = true;
    },
  },
  mounted() {
    console.log('Activated');
    console.log(this.language.index);
    if (this.code) {
      this.useCustomCode();
    }
  },
  methods: {
    onCmReady(cm) {
      console.log('cm ready');
      this.cm = cm;
      loadTheme();
      if (this.language.name) {
        loadMode(this.cm, this.language.mode);
        this.editorReady = true;
      }
      cm.focus();
      this.fixHeight();
      window.addEventListener('resize', this.fixHeight);
    },
    fixHeight() {
      if (this.timeout) window.clearTimeout(this.timeout);
      this.timeout = window.setTimeout(() => {
        const scroll = this.$refs.codemirror.$el.getElementsByClassName('CodeMirror-scroll')[0];
        console.log(this.$refs.codemirror.$el.offsetHeight);
        scroll.style.maxHeight = `${this.$refs.codemirror.$el.offsetHeight}px`;
        scroll.style.width = `${this.$refs.codemirror.$el.offsetWidth}px`;
      }, 100);
    },
    useCustomCode() {
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.$store.commit('SET_CUSTOM_CODE', {
          text: this.code,
          tabSize: this.selectedSize,
          lines: this.numberOfLines,
          showEditor: true,
        });
      }, 1000);
    },
    clear() {
      console.log('clear');
      this.code = '';
    },

  },
};
</script>

<style lang="sass" scoped>
.tab-settings
  height: 40px

  .tab-size-option
    display: inline-flex
    flex-direction: column
    justify-content: space-around
    align-items: center
    width: 3em
    height: 3em
    margin-left: 1em
    cursor: pointer
    box-shadow: 0px 0px 2px 2px rgba(black, .1)
    background: linear-gradient(to right, $purple-gradient-colors 49.8%, $grid-color 49.8%)
    background-size: 200%
    background-position: 99.8% 0 // 1px glitch
    transition: background .2s ease-in
  .selected
    transition: background .4s ease-in-out
    background-position: left

.warning
  pointer-events: none
  height: 40px
  line-height: 40px
  position: absolute
  width: 100%
  text-align: right

  .arrow
    margin-left: 1em

.codemirror
  flex-grow: 1
  opacity: 0
  // width: 100%
  margin-top: $gap
  transition: opacity .5s ease-in
  position: relative

  ::v-deep .CodeMirror-scroll
    &::-webkit-scrollbar
      display: none

  ::v-deep .CodeMirror-vscrollbar, ::v-deep .CodeMirror-hscrollbar
    &::-webkit-scrollbar
      width: $gap / 2
    &::-webkit-scrollbar-thumb
      background: linear-gradient(to top, $purple-gradient-colors)
    &::-webkit-scrollbar-track
      background-color: $grid-color
    &::-webkit-scrollbar-corner
      background-color: $grid-color

.ready
  opacity: 1

.buttons
  margin-top: 3em

@media (max-width: 1270px)
  .warning
    display: none
</style>
