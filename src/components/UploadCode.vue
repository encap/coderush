<template>
  <div ref="wrapper" class="wrapper">
    <div class="settings">
      <div class="flex-row">
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

        <label
          v-show="language.index && $route.path === '/contribute'"
          class="expand"
        >
          <fa :icon="['fas', expand ? 'compress-alt' : 'expand-alt']" />
          <input
            v-model="expand"
            type="checkbox"
            @change="toggleExpand"
          >
        </label>
        <span v-show="!language.index && !(room.connected && !room.admin)" class="language-warning">
          Choose language <fa class="arrow" :icon="['fas', 'play']" />
        </span>
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
      expand: false,
    };
  },
  computed: {
    ...mapGetters(['language', 'room', 'customCode']),
    cmOptions() {
      return {
        tabSize: this.selectedSize,
        readOnly: this.room.connected && !this.room.admin,
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
      await loadMode(this.cm, this.language.mode, this.language.mime);
      this.fixHeight();
      this.editorReady = true;
    },
    customCode: {
      immediate: true,
      deep: true,
      handler(current) {
        if (this.room.connected && !this.room.admin) {
          this.code = current.text;
          this.selectedSize = current.tabSize || 2;
        }
      },
    },
    'room.admin': {
      deep: true,
      handler(current) {
        if (current) {
          this.$socket.client.emit('customCodeData', {
            text: this.code,
            tabSize: this.selectedSize,
            lines: this.numberOfLines,
            showEditor: this.customCode.showEditor,
          });
        }
      },
    },
    selectedSize() {
      if (this.room.admin) {
        this.$socket.client.emit('customCodeData', {
          text: this.code,
          tabSize: this.selectedSize,
          lines: this.numberOfLines,
          showEditor: true,
        });
      }
    },
  },
  mounted() {
    if (this.code) {
      this.useCustomCode();
    }
  },
  activated() {
    if (this.cm) {
      this.$emit('cmReady');
    }
  },
  methods: {
    toggleExpand() {
      this.$emit('expand', this.expand);
      this.$nextTick(this.fixHeight);
    },
    onCmReady(cm) {
      this.cm = cm;
      loadTheme();
      if (this.language.name) {
        loadMode(this.cm, this.language.mode, this.language.mime);
        this.editorReady = true;
      }
      cm.focus();
      this.$nextTick(this.fixHeight);
      window.addEventListener('resize', this.fixHeight);
      this.$emit('cmReady');
    },
    fixHeight() {
      if (this.timeout) window.clearTimeout(this.timeout);
      this.timeout = window.setTimeout(() => {
        const scroll = this.$refs.wrapper.getElementsByClassName('CodeMirror-scroll')[0];
        scroll.style.maxHeight = `calc(${this.$refs.wrapper.offsetHeight}px - 4em)`;
        scroll.style.width = `${this.$refs.wrapper.offsetWidth}px`;
      }, 100);
    },
    useCustomCode() {
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        const data = {
          text: this.code,
          tabSize: this.selectedSize,
          lines: this.numberOfLines,
          showEditor: true,
          short: this.customCode.text.length < 30 || this.customCode.lines < 4,
        };
        this.$store.commit('SET_CUSTOM_CODE', data);
        if (this.room.admin) {
          this.$socket.client.emit('customCodeData', data);
        }
      }, 50);
    },
    clear() {
      this.code = '';
    },
  },
};
</script>

<style lang="sass" scoped>
.flex-row
  display: flex
  align-items: center
  justify-content: space-between
  width: 100%

  label
    display: inline-flex
    align-items: center
    justify-content: space-around
    flex-direction: column
    background: $navy-grey
    box-shadow: 0px 0px 2px 2px rgba(black, .1)
    cursor: pointer
    margin-left: 1em
    width: 3em
    height: 3em

  .tab-size-option
    background: linear-gradient(to right, $purple-gradient-colors 49.8%, $navy-grey 49.8%)
    background-position: 99.8% 0 // 1px glitch
    background-size: 200%
    transition: background .2s ease-in
  .selected
    background-position: left
    transition: background .4s ease-in-out


  .language-warning .arrow
    margin-left: 1em

.codemirror
  flex-grow: 1
  position: relative
  margin-top: 1em
  opacity: 0
  overflow: visible
  width: 100%
  transition: opacity .5s ease-in

  ::v-deep .CodeMirror-scroll
    &::-webkit-scrollbar
      display: none

  ::v-deep .CodeMirror-vscrollbar, ::v-deep .CodeMirror-hscrollbar
    &::-webkit-scrollbar
      width: $gap / 2
    &::-webkit-scrollbar-thumb
      background: linear-gradient(to top, $purple-gradient-colors)
    &::-webkit-scrollbar-track
      background-color: $navy-grey
    &::-webkit-scrollbar-corner
      background-color: $navy-grey

.ready
  opacity: 1

.buttons
  margin-top: 3em

@media (max-width: 1270px)
  .language-warning
    display: none
</style>
