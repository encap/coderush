<template>
  <div
    ref="code"
    class="code"
    :class="{ready: cmReady, completed: isCompleted, heatMap: heatMapReady}"
    @keydown.capture.prevent="onKeyDown"
  >
    <codemirror
      ref="codemirror"
      v-model="codeText"
      class="codemirror"
      :options="cmOptions"
      @ready="onCmReady"

      @blur="onUnFocus"
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
      cm: {},
      codeText: '',
      started: false,
      isCompleted: false,
      cmReady: false,
      heatMapReady: false,
      toFix: 0,
      markers: [],
      currentLine: 0,
      currentChar: 0,
      correctCharsInLine: 0,
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
        // undoDepth: 0,
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
        readOnly: true,
        extraKeys: {
          Backspace: () => {
            console.log(`backspace: ${this.toFix}`);
            if (this.toFix > 0) {
              // TODO
              this.toFix -= 1;
            }
          },
          Tab: () => {}, // TODO soft tab
          Enter: () => {
            if (!this.stats.oneThirdTime && this.currentLine === Math.floor(this.codeInfo.lines / 3)) {
              this.stats.oneThirdCharsCount = 0 - 1; // TODO
              this.stats.oneThirdTime = this.timeElapsed();
            } else if (!this.stats.lastThirdStartTime && this.currentLine === Math.floor(this.codeInfo.lines / 3 * 2)) {
              this.stats.lastThirdCharsCount = this.codeText.length - 0 - 1; // TODO
              this.stats.lastThirdStartTime = this.timeElapsed();
            }
          },
        },
        Insert: () => {
          if (this.currentLine < this.codeInfo.lines) {
            this.toFix = 0;
            this.stats.cheat = true;

            this.currentLine += 1;
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
          // TODO
          this.completed(false);
        },
        PageUp: () => {},
        PageDown: () => {},
        'Ctrl-A': () => {},
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
        this.cm.focus();
        this.popUpClickable = false;
      }
      this.showPopUp = action;
    },
    onCmReady(cm) {
      this.cm = cm;

      this.init(); // TODO
      this.fixHeight();
      window.addEventListener('resize', this.fixHeight);

      // cm.setOption('readOnly', true);
    },
    onKeyDown(ev) {
      console.log(ev);
      // const allowedKeys = 'qwertyuiopasdfghjklzxcvbnm1234567890!@#$%^&*()-=_+[]{};\'\\:"|,./<>?`~';
      const handleEnter = () => {
        // const markers = this.cm.findMarksAt({ line: this.currentLine, ch: 0 });
        // console.log(markers);
        const expectedText = this.cm.getLine(this.currentLine);
        // console.green(expectedText);
        if (this.correctCharsInLine === expectedText.length) {
          this.cm.execCommand('goCharRight');
          this.currentChar = 0;
          this.correctCharsInLine = 0;
          this.currentLine += 1;
        }
      };

      if (ev.key === 'Shift') {
        // prevent double event
      } else if (ev.key === 'Insert') {
        this.cm.execCommand('goLineEnd');
        this.cm.execCommand('goCharRight');
        this.cm.markText(
          { line: this.currentLine, ch: this.currentChar },
          { line: this.currentLine, ch: this.cm.getLine(this.currentLine).length + 1 },
          { className: 'correct' },
        );
        this.currentLine += 1;
        this.currentChar = 0;
        this.correctCharsInLine = 0;
      } else if (ev.key === 'End') {
        this.cm.execCommand('goDocEnd');
        this.cm.markText(
          { line: 0, ch: 0 },
          { line: this.codeInfo.lines + 1, ch: 1 },
          { className: 'correct' },
        );
        this.currentLine = this.codeInfo.lines - 1;
        this.currentChar = this.cm.getLine(this.currentLine);
        this.correctCharsInLine = this.currentChar;
        this.completed();
      } else if (ev.key === 'Enter') {
        handleEnter();
      } else if (ev.key === 'Backspace') {
        if (this.toFix) {
          this.toFix -= 1;
          this.cm.execCommand('goCharLeft');
          this.cm.execCommand('undo'); // clear marker
          this.currentChar -= 1;
          console.blue(`Deleted tofix: ${this.toFix}`);
        } else {
          console.blue('Blocked Nothing to fix');
        }
      } else {
        const lineText = this.cm.getLine(this.currentLine);
        if (this.currentChar !== lineText.length) { // block too long lines
          const expectedChar = lineText[this.currentChar];
          if (ev.key === expectedChar) {
            console.green(`correct '${ev.key}'`);
            if (this.toFix) {
              console.red(`blocked unfixed mistakes: ${this.toFix}`);
            } else {
              this.cm.markText(
                { line: this.currentLine, ch: this.currentChar },
                { line: this.currentLine, ch: this.currentChar + 1 },
                { className: 'correct' },
              );
              this.cm.execCommand('goCharRight');
              this.currentChar += 1;
              this.correctCharsInLine += 1;

              if (this.currentLine + 1 === this.codeInfo.lines && this.correctCharsInLine === this.cm.getLine(this.currentLine).length) {
                this.completed();
              }
            }
          } else {
            this.toFix += 1;
            console.red(`wrong: ${this.toFix}`);
            this.cm.markText(
              { line: this.currentLine, ch: this.currentChar },
              { line: this.currentLine, ch: this.currentChar + 1 },
              { className: 'mistake', addToHistory: true },
            );
            this.cm.execCommand('goCharRight');
            this.currentChar += 1;
          }
        } else {
          console.red('overshoot');
        }
      }
    },
    onUnFocus(_, ev) {
      if (!this.isCompleted) {
        this.cm.focus(); // dev
        if (ev.relatedTarget !== null) {
          if (ev.relatedTarget.tagName !== 'BUTTON' && ev.relatedTarget.tagName !== 'A') {
            // this.popUp(true, 'Resume'); // dev
          }
        } else {
          // this.popUp(true, 'Resume');
        }
      }
    },
    fixHeight() {
      if (this.timeout) window.clearTimeout(this.timeout);
      this.timeout = window.setTimeout(() => {
        const height = `${this.$refs.code.offsetHeight}px`;
        const scroll = this.$refs.codemirror.$el.getElementsByClassName('CodeMirror-scroll')[0];
        scroll.style.maxHeight = height;
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
    onCmBeforeChange(_, change) {
      // console.log(`change origin: ${change.origin}`);
      const o = change.origin;
      if (o === 'cut' || o === 'paste') {
        console.log('UNALLOWED EVENT');
        change.cancel();
        if (o === 'cut') {
          // codemirror lib edgecase
          // this.0Cm.execCommand('goLineUp');
          // this.0Cm.execCommand('goLineEnd');
          // this.cm.execCommand('goLineUp'); TODO

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

        const expectedText = this.cm.getRange(from, to);

        this.currentChange = {
          ...this.currentChange,
          time: this.timeElapsed(),
          position: {
            from,
            to,
          },
        };

        if (text !== '' && this.started) {
          if (text !== expectedText) {
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
        // this.markers.unshift(this.0Cm.markText(...this.currentTextMark)); TODO
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

      if (this.toFix === 0 && 0 - 1 === this.codeText.length && this.codeText === 0) { // TODO code checks
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
      this.cm.markText(
        { line: 0, ch: 0 },
        { line: this.codeInfo.lines + 1, ch: 1 },
        { className: 'bugfix' },
      );
      this.popUp(false, 'START');
      this.started = true;
      this.cm.focus();
      console.log('START');
      this.stats.startTime = Date.now();
    },
    init() {
      const initTime = Date.now();
      const interval = setInterval(() => {
        this.countdown -= 0.5;
        this.popUpText = Math.ceil(this.countdown);
        if (this.countdown === 2) {
          if (!this.cmReady || !this.codeText) {
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
          this.start(interval);
        }
      }, 100);


      // console.log('loadMode ', Date.now());

      Promise.all([this.getCode(), loadTheme(this.options.selectedTheme), loadMode(this.cm, this.language.mode)])
        .then((resp) => {
          // console.log(resp);
          [this.codeText] = resp;
          this.cmReady = true;
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
      this.$socket.client.emit('completed', Date.now());

      // this.0Cm.setOption('cursorBlinkRate', -1); TODO

      if (currentStats) {
        this.stats = {
          ...this.stats,
          timeFromFirstInput: this.timeElapsed(),
          codeLength: 0, // TODO
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
          this.cm.markText(from, to, { className: 'mistake' });
          console.log(this.cm.getAllMarks);
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
  pointer-events: none
  position: relative
  outline: none
  transition: opacity .5s ease-in
  transition-delay: .7s

  &.ready
    opacity: 1

  // #0 ::v-deep
  //   .underScore
  //     display: inline-block
  //     font-size: 0.9em
  //     transform: translateY(4px) !important
  //     filter: saturate(70%)
  //   .underScoreHidden
  //     opacity: 0
  //   .CodeMirror-linenumber
  //     opacity: 0


.codemirror ::v-deep

  .CodeMirror-line
    line-break: anywhere !important // TODO propably not needed
    // z-index: 0
    // opacity: 0.7
    // filter: saturate(80%)
    transition: opacity 2s, filter 2s

    span > span
      transition: filter 1s ease-out
      filter: grayscale(40%) brightness(80%)

    .correct
      filter: none

    .mistake
      background-color: rgba(255, 255, 255, .3)


  .CodeMirror-scroll
    padding-right: .7em

  .CodeMirror-vscrollbar
    &::-webkit-scrollbar
      width: $gap / 2
    &::-webkit-scrollbar-thumb
      background: linear-gradient(to top, $purple-gradient-colors)
    &::-webkit-scrollbar-track
      background-color: $grid-color



.completed
  .codemirror ::v-deep

    .mistake
      background-color: transparent
      transition: margin $nav-trans-dur $nav-trans-timing, padding $nav-trans-dur $nav-trans-timing, background-color .5s ease-out 1s, box-shadow .5s ease-out 1s



.heatMap
  .codemirror
    ::v-deep
      .mistake
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
