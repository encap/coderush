<template>
  <div
    ref="code"
    class="code"
    :class="{ready: editorsReady, completed: isCompleted, heatMap: heatMapReady}"
  >
    <codemirror
      id="original"
      ref="original"
      v-model="originalCode"
      :options="cmOptions"
      @ready="onOriginalCmReady"
    />

    <codemirror
      id="editor"
      ref="editor"
      v-model="editorCode"
      :options="cmOptions"
      @ready="onEditorCmReady"
      @changes="onCmCodeChange"
      @beforeChange="onBeforeChange"
      @blur="onUnFocus"
      @scroll="onScroll"
    />
    <div class="pop-up" :class="{hidden: !showPopUp, clickable: popUpClickable, 'small-font': popUpText.length > 15}">
      <h2 @click="popUp(false)">
        {{ popUpText }}
      </h2>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import axios from 'axios';
import { codemirror } from 'vue-codemirror';

import { loadMode, loadTheme } from '@/cmLoader';

import 'codemirror/lib/codemirror.css';
// import 'codemirror/addon/edit/closebrackets';
// import 'codemirror/addon/selection/active-line';

// eslint-disable-next-line no-unused-vars
import stats from '../stats';

export default {
  components: {
    codemirror,
  },
  data() {
    return {
      timeout: 0,
      countdown: 3,
      showPopUp: true,
      popUpClickable: false,
      popUpText: 3,
      originalCm: {},
      editorCm: {},
      originalCode: '',
      editorCode: '',
      started: false,
      isCompleted: false,
      editorsReady: false,
      heatMapReady: false,
      toFix: 0,
      markers: [],
      currentLineNr: 0,
      currentChange: {},
      stats: {
        history: [],
        cheat: false,
        firstCharTime: 0,
      },
    };
  },
  computed: {
    ...mapGetters(['language', 'options', 'codeInfo', 'customCode']),
    cmOptions() {
      return {
        undoDepth: 0,
        tabSize: this.tabWidth,
        styleActiveLine: false,
        lineNumbers: this.options.lineNumbers,
        styleSelectedText: false,
        lineWrapping: true,
        matchBrackets: false,
        dragDrop: false,
        autoCloseBrackets: false,
        cursorBlinkRate: 320,
        smartIndent: false,
        lint: false,
        spellcheck: false,
        autocorrect: false,
        showCursorWhenSelecting: true,
        theme: this.options.selectedTheme,
        // cursorScrollMargin: 200,
        // scrollbarStyle: null,
        extraKeys: {
          Backspace: () => {
            console.log(`backspace: ${this.toFix}`);
            if (this.toFix > 0) {
              this.editorCm.execCommand('delCharBefore');
              this.toFix -= 1;
            }
          },
          Tab: () => this.editorCm.execCommand('insertSoftTab'),
          Enter: () => {
            if (this.editorCm.getLine(this.currentLineNr).slice(0, -1) === this.originalCm.getLine(this.currentLineNr)) {
              // console.blue('go line down');
              this.currentLineNr += 1;


              if (this.currentLineNr + 1 === this.codeInfo.lines) {
                this.editorCm.replaceRange('', { line: this.currentLineNr - 1, ch: 999 }, { line: this.codeInfo.lines + 1 });

                this.editorCm.replaceSelection('\n');
              } else {
                this.editorCm.replaceSelection('\n');
                // this.editorCm.startOperation();
                this.editorCm.execCommand('goLineDown');
                this.editorCm.execCommand('deleteLine');
                this.editorCm.execCommand('goLineUp');
              }

              if (!this.originalCm.getLine(this.currentLineNr)) {
                // dont show underscore on empty line
                this.hiddenUnderscore = this.editorCm.markText({ line: this.currentLineNr, ch: 0 }, { line: this.currentLineNr, ch: 1 }, { className: 'underScoreHidden' });
              } else {
                if (this.hiddenUnderscore) {
                  this.hiddenUnderscore.clear();
                }
                if (this.options.autoIndent) {
                  const indentText = this.originalCm.getLine(this.currentLineNr).match('[^\\S]*')[0];
                  this.editorCm.replaceSelection(indentText);
                }
              }

              if (!this.stats.oneThirdTime && this.currentLineNr === Math.floor(this.codeInfo.lines / 3)) {
                this.stats.oneThirdCharsCount = this.editorCode.length - 1;
                this.stats.oneThirdTime = this.timeElapsed();
              } else if (!this.stats.lastThirdStartTime && this.currentLineNr === Math.floor(this.codeInfo.lines / 3 * 2)) {
                this.stats.lastThirdCharsCount = this.originalCode.length - this.editorCode.length - 1;
                this.stats.lastThirdStartTime = this.timeElapsed();
              }
            }
          },
          Insert: () => {
            if (this.currentLineNr < this.codeInfo.lines) {
              this.toFix = 0;
              this.stats.cheat = true;

              const text = this.originalCm.getLine(this.currentLineNr);
              if (this.hiddenUnderscore) {
                this.hiddenUnderscore.clear();
              }
              if (this.currentLineNr + 1 === this.codeInfo.lines) {
                this.editorCm.replaceRange(text, { line: this.currentLineNr, ch: 0 }, { line: this.currentLineNr + 1, ch: 9999 });
                this.editorCm.execCommand('goLineDown');
                this.completed();
              } else {
                this.editorCm.replaceRange('', { line: this.currentLineNr }, { line: this.currentLineNr + 1 });
                this.editorCm.replaceSelection('\n');
                this.editorCm.scrollIntoView(null);

                this.editorCm.replaceRange(text, { line: this.currentLineNr, ch: 0 }, { line: this.currentLineNr, ch: 9999 });
              }
              this.currentLineNr += 1;
            }
          },
          // disable keys
          Up: () => {},
          Down: () => {},
          Left: () => {},
          Right: () => {},
          Delete: () => {},
          Home: () => { this.completed(); },
          End: () => {
            this.editorCode = this.originalCode;
            this.completed(false);
          },
          PageUp: () => {},
          PageDown: () => {},
          'Ctrl-A': () => {},
        },
      };
    },
    tabWidth() {
      return this.customCode.tabSize ? this.customCode.tabSize : this.codeInfo.tabSize;
    },
  },
  methods: {
    popUp(action, text = this.popUpText) {
      this.popUpText = text;

      if (action) {
        if (text === 'Resume') {
          this.popUpClickable = true;
        }
      } else {
        this.editorCm.focus();
        this.popUpClickable = false;
      }
      this.showPopUp = action;
    },
    onOriginalCmReady(cm) {
      cm.setOption('readOnly', true);
      this.originalCm = cm;
      // console.log('originalCmReady ', Date.now());
    },
    onEditorCmReady(cm) {
      this.editorCm = cm;
      // console.log('editorCmReady ', Date.now());
      this.fixHeight();
      this.init();
      window.addEventListener('resize', this.fixHeight);
    },
    onUnFocus(_, ev) {
      if (!this.isCompleted) {
        if (ev.relatedTarget !== null) {
          console.green(ev.relatedTarget.tagName);
          if (ev.relatedTarget.tagName !== 'BUTTON' && ev.relatedTarget.tagName !== 'A') {
            this.popUp(true, 'Resume');
          }
        } else {
          this.popUp(true, 'Resume');
        }
      }
    },
    onScroll() {
      // this.originalCm.scrollIntoView(this.editorCm.getCursor(), this.cmOptions.cursorScrollMargin);
      const scrollInfo = this.editorCm.getScrollInfo();
      console.green(`SCROLL ${scrollInfo.top}`);

      this.originalCm.scrollTo(0, scrollInfo.top);
    },
    fixHeight() {
      if (this.timeout) window.clearTimeout(this.timeout);
      this.timeout = window.setTimeout(() => {
        console.log(this.$refs);
        const height = `${this.$refs.code.offsetHeight}px`;
        const editorScroll = this.$refs.editor.$el.getElementsByClassName('CodeMirror-scroll')[0];
        console.blue(height);
        editorScroll.style.maxHeight = height;
        // editorScroll.style.width = `${this.$refs.codemirror.$el.offsetWidth}px`;
        const originalScroll = this.$refs.original.$el.getElementsByClassName('CodeMirror-scroll')[0];
        console.log();
        originalScroll.style.maxHeight = height;
        // originalScroll.style.width = `${this.$refs.codemirror.$el.offsetWidth}px`;
      }, 100);
    },
    registerKeyStrokes(ev) {
      this.currentKeyEv = {
        key: ev.key,
        keyCode: ev.keyCode,
        shift: ev.shiftKey,
        alt: ev.altKey,
        ctrl: ev.ctrlKey,
        meta: ev.metaKey,
      };
    },
    onBeforeChange(_, change) {
      // console.log(`change origin: ${change.origin}`);
      const o = change.origin;
      if (o === 'undo' || o === 'cut' || o === 'paste') {
        console.log('UNALLOWED EVENT');
        change.cancel();
        if (o === 'cut') {
          // codemirror lib edgecase
          this.editorCm.execCommand('goLineUp');
          this.originalCm.execCommand('goLineUp');
          this.editorCm.execCommand('goLineEnd');
        }
      } else if (change.origin !== 'setValue') {
        const from = {
          line: change.from.line,
          ch: change.from.ch,
        };

        const text = change.text[0];
        console.log(`change '${text}'`);

        const to = {
          line: from.line,
          ch: from.ch + text.length,
        };

        const expectedText = this.originalCm.getRange(from, to);

        this.currentChange = {
          ...this.currentChange,
          time: this.timeElapsed(),
          position: {
            from,
            to,
          },
        };

        if (text !== '' && this.started) {
          if (this.editorCm.getLine(this.currentLineNr).length - 1 >= this.originalCm.getLine(this.currentLineNr).length) {
            console.log(`cancel change end of line ${this.originalCm.getLine(this.currentLineNr).length}`);
            this.currentChange.type = 'lineEnd';

            change.cancel();
          } else if (text !== expectedText) {
            console.warn(`'${text}' dont match '${expectedText}'`);

            this.toFix += text.length;

            this.currentTextMark = [
              from,
              to,
              { className: 'mark' },
            ];

            this.currentChange = {
              ...this.currentChange,
              type: 'mistake',
              fixQueuePos: this.toFix,
              expectedText,
            };
          } else if (this.toFix > 0) {
            // force user to correct previous mistakes
            console.log('fix mistakes first');
            this.currentChange.type = 'leftUnfixed';
            change.cancel();
          } else {
            this.currentChange.type = 'correct';
          }
        } else {
          this.currentChange.type = 'backspace';
        }
      }
    },
    async onCmCodeChange(_, [change]) {
      if (this.toFix > 0 && this.currentTextMark.length === 3) {
        // console.warn(`NEW MARKER: line: ${this.currentTextMark[0].line}, from: ${this.currentTextMark[0].ch}, to: ${this.currentTextMark[1].ch}`);
        this.markers.unshift(this.editorCm.markText(...this.currentTextMark));
        this.currentTextMark = [];
      }
      if (this.started && !this.stats.firstCharTime) {
        this.stats.firstCharTime = Date.now();
      }

      if (this.currentChange.type === 'correct' || this.currentChange.type === 'mistake') {
        this.currentChange = {
          ...this.currentChange,
          ...this.currentKeyEv,
          text: change.text[0],
        };
      }

      this.stats.history.push(this.currentChange);
      this.currentChange = {};

      if (this.toFix === 0 && this.editorCode.length - 1 === this.originalCode.length && this.editorCode.slice(0, -1) === this.originalCode) {
        this.completed();
      }
    },
    async getCode() {
      if (!this.codeInfo.name) {
        return this.customCode.text;
      }
      const url = `${process.env.VUE_APP_URL}/code/${this.language.name.replace('#', '_sharp')}/${this.codeInfo.name}.${this.language.ext}`;
      try {
        const resp = await axios.get(url);
        return resp.data;
      } catch (err) {
        if (err.request) {
          throw new Error('No internet');
        } else {
          throw err;
        }
      }
    },
    start(interval) {
      clearInterval(interval);
      this.popUp(false, 'START');
      this.started = true;
      this.editorCm.focus();
      console.log('START');
      this.stats.startTime = Date.now();
      this.$refs.editor.$el.addEventListener('keydown', this.registerKeyStrokes);
    },
    init() {
      const initTime = Date.now();
      const interval = setInterval(() => {
        this.countdown -= 0.5;
        this.popUpText = Math.ceil(this.countdown);
        if (this.countdown === 2) {
          if (!this.editorsReady || !this.originalCode) {
            this.countdown += 0.5;
            console.warn(Date.now() - initTime);
            if ((Date.now() - initTime) / 1000 < 5) {
              this.popUpText = 'Waiting for download...';
            } else {
              console.warn('Long loading time');
              this.popUpText = 'It probably crashed but you can wait a few seconds just in case';
            }
          }
        } else if (this.countdown === 0) {
          for (let i = 2; i <= this.codeInfo.lines; i += 1) {
            this.editorCode += '\n';
          }

          this.$nextTick(() => {
            this.editorCm.replaceSelection(this.options.underScore ? '_' : ' ');

            if (this.options.underScore) {
              this.editorCm.markText({ line: this.currentLineNr, ch: 0 }, { line: this.currentLineNr, ch: 1 }, { className: 'underScore' });
            }
            this.editorCm.execCommand('goColumnLeft');
            this.start(interval);
          });
        }
      }, 500);


      // console.log('loadMode ', Date.now());

      Promise.all([this.getCode(), loadTheme(this.options.selectedTheme), loadMode(this.originalCm, this.language.mode)])
        .then((resp) => {
          // console.log(resp);
          [this.originalCode] = resp;
          // when mode files are downloaded set mode on editor too
          this.editorCm.setOption('mode', this.language.mode);
          this.editorsReady = true;
        })
        .catch((err) => {
          clearInterval(interval);
          console.log(err);
          if (err.message === 'No internet') {
            this.popUpText = 'Connection with server not available.';
          } else {
            this.popUpText = 'Please try again later';
          }
        });
    },
    completed(currentStats = true) {
      if (this.$route.path === '/results') {
        return;
      }

      this.popUp(true, 'Congratulations');
      // console.warn('COMPLETED');
      this.editorCm.setOption('readOnly', true);
      this.$socket.client.emit('completed', Date.now());
      this.$refs.editor.$el.removeEventListener('mousedown', this.registerKeyStrokes);

      this.editorCm.setOption('cursorBlinkRate', -1);

      if (currentStats) {
        this.stats = {
          ...this.stats,
          timeFromFirstInput: this.timeElapsed(),
          codeLength: this.editorCode.length,
          file: this.codeInfo,
        };
      } else {
        this.stats = stats;
      }


      // console.warn(`TOTAL TIME: ${this.stats.timeFromFirstInput}`);
      // console.log(JSON.parse(JSON.stringify(this.stats)));


      this.$emit('completed', this.stats);
      // console.log('completed class', this.timeElapsed());
      this.isCompleted = true;
      setTimeout(this.generateHeatMap, 60);
    },
    generateHeatMap() {
      const arr = this.stats.history;
      for (let i = 1; i < arr.length; i += 1) {
        let from;
        let to;
        if (arr[i].type === 'mistake') {
          from = arr[i].position.from;
          for (let j = i + 1; j < arr.length; j += 1) {
            if (arr[j].type !== 'mistake') {
              to = arr[j - 1].position.to;
              i = j;
              break;
            }
          }
          this.editorCm.markText(from, to, { className: 'mark' });
        }
      }
      // console.log('heatmap ready', this.timeElapsed());
      setTimeout(() => {
        this.heatMapReady = true;
        this.$router.replace('/results');
        this.popUp(false);
      }, 2000);
    },
    timeElapsed() {
      return Date.now() - this.stats.firstCharTime;
    },
  },
};
</script>

<style lang="sass" scoped>
.code
  height: 100%
  opacity: 0
  // pointer-events: none !important
  position: relative
  transition: opacity .5s ease-in
  transition-delay: .7s

  &.ready
    opacity: 1

  ::v-deep
    .CodeMirror-line
      line-break: anywhere !important

    .mark
      background-color: rgba(255, 255, 255, .3)

    .CodeMirror

      .CodeMirror-scroll
        padding-right: .7em
        &::-webkit-scrollbar
          display: none

      .CodeMirror-vscrollbar
        &::-webkit-scrollbar
          width: $gap / 2
        &::-webkit-scrollbar-thumb
          background: transparent
        &::-webkit-scrollbar-track
          background-color: transparent



#editor
  position: absolute
  top: 0
  width: 100%
  ::v-deep
    .underScore
      display: inline-block
      font-size: 0.9em
      transform: translateY(4px) !important
      filter: saturate(70%)
    .underScoreHidden
      opacity: 0
    .CodeMirror-linenumber
      opacity: 0
    .CodeMirror-vscrollbar
        &::-webkit-scrollbar
          width: $gap / 2
        &::-webkit-scrollbar-thumb
          background: linear-gradient(to top, $purple-gradient-colors)
        &::-webkit-scrollbar-track
          background-color: $grid-color


#original ::v-deep .CodeMirror-line
  z-index: 0
  opacity: 0.7
  filter: saturate(80%)
  transition: opacity 2s, filter 2s


.completed
  #original ::v-deep .CodeMirror-code span
    color: transparent !important

  ::v-deep .mark
    background-color: transparent
    transition: margin $nav-trans-dur $nav-trans-timing, padding $nav-trans-dur $nav-trans-timing, background-color .5s ease-out 1s, box-shadow .5s ease-out 1s



.heatMap
  #original
    opacity: 1
    ::v-deep
      .CodeMirror-line
        opacity: 1
      .CodeMirror-linenumber
        opacity: 0

  #editor ::v-deep
    .CodeMirror, CodeMirror-gutters
      background: transparent
    .CodeMirror-linenumber
      opacity: 1

  ::v-deep .mark
    background-color: $grid-color
    box-shadow: -2px 2px 8px 0px rgba(0,0,0,.6)
    // outline: 0.2em solid $grid-color
    padding: 0.1em 0.2em
    // margin: 0.2em
    opacity: 1


@keyframes opacity-enter
  from
    opacity: 0
  to
    opacity: 1
@keyframes opacity-leave
  from
    opacity: 1
  to
    opacity: 0

.pop-up
  position: fixed
  top: 0
  bottom: 0
  left: 0
  right: 0
  background-color: rgba($grid-color, .5)
  display: flex
  justify-content: space-around
  align-items: center
  pointer-events: all
  user-select: none
  z-index: 10
  font-size: 4rem
  opacity: 1
  animation: opacity-enter .7s ease-out forwards
  cursor: default

  &.hidden
    pointer-events: none
    animation: opacity-leave .7s linear forwards .1s

  &.clickable
    // pointer-events: all
    h2
      cursor: pointer
  &.small-font
    font-size: 1.5rem

    h2
      max-width: 50vw
      text-align: center

</style>
