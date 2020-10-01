<template>
  <div ref="container" class="container">
    <div
      class="code"
      :class="{ready: cmReady, completed: isCompleted}"
      @keydown.capture.prevent="onKeyDown"
    >
      <codemirror
        ref="codemirror"
        v-model="codeText"
        class="codemirror"
        :class="{showInvisibles: language.name === 'Whitespace'}"
        :options="cmOptions"
        @ready="onCmReady"

        @blur="onUnFocus"
      />
    </div>
    <div class="pop-up" :class="{hidden: !showPopUp, clickable: popUpClickable, 'small-font': popUpText.length > 15}">
      <div>
        <h2 @click="popUp(false)">
          {{ popUpText }}
        </h2>
        <p v-show="isCompleted">
          Loading your results...
        </p>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-tabs */

import { mapGetters } from 'vuex';
import axios from 'axios';

// import { loadMode, loadTheme } from '@/cmLoader';

// import { codemirror } from 'vue-codemirror';
// import codemirror from 'vue-codemirror/src/codemirror.vue';
import stats from '../stats2';

// const { codemirror } = () => import(/* webpackChunkName: "vueCodeMirror" */ 'vue-codemirror');
// import 'codemirror/addon/edit/closebrackets';
// import 'codemirror/addon/selection/active-line';

// const codemirror = () => import(/* webpackChunkName: "vueCodeMirror" */ 'vue-codemirror').then((module) => ({ default: module.codemirror }));
// const codemirror2 = () => import(/* webpackChunkName: "vueCodeMirror" */ 'vue-codemirror');
let loadMode; let
  loadTheme;
const codemirror = () => import(/* webpackChunkName: "cmLoader" */ '@/cmLoader.js').then((module) => {
  loadMode = module.loadMode;
  loadTheme = module.loadTheme;
  return module.default;
});


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
      popUpText: '3',
      cm: {},
      codeText: '',
      started: false,
      isCompleted: false,
      cmReady: false,
      toFix: 0,
      rightMostMistakeMarked: false,
      markers: [],
      currentLine: 0,
      currentChar: 0,
      correctCharsInLine: 0,
      currentChange: {},
      stats: {
        history: [],
        cheat: false,
        firstCharTime: 0,
        earlyFinish: false,
      },
    };
  },
  computed: {
    ...mapGetters(['language', 'options', 'codeInfo', 'customCode', 'room']),
    cmOptions() {
      return {
        showInvisibles: this.language.name === 'Whitespace',
        maxInvisibles: 2,
        undoDepth: 0,
        tabSize: this.tabWidth,
        styleActiveLine: false,
        lineNumbers: this.options.lineNumbers,
        styleSelectedText: true,
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
        cursorScrollMargin: 100,
        readOnly: true,
      };
    },
    tabWidth() {
      return this.customCode.tabSize ? this.customCode.tabSize : this.codeInfo.tabSize;
    },
  },
  methods: {
    popUp(action, text = this.popUpText) {
      console.log('POPUP ', action);
      this.popUpText = text;

      if (action) {
        if (text === 'Resume') {
          this.popUpClickable = true;
        }
      } else {
        this.popUpClickable = false;
        this.cm.focus();
      }
      this.showPopUp = action;
    },
    onCmReady(cm) {
      this.cm = cm;

      this.init(); // TODO
      this.fixHeight();

      // cm.setOption('readOnly', true);
    },
    onKeyDown(ev) {
      console.log(ev);
      // const allowedKeys = 'qwertyuiopasdfghjklzxcvbnm1234567890!@#$%^&*()-=_+[]{};\'\\:"|,./<>?`~';

      const handleEnter = () => {
        const expectedText = this.cm.getLine(this.currentLine);
        // console.green(expectedText);
        if (this.correctCharsInLine === expectedText.length) {
          this.cm.execCommand('goCharRight');
          this.currentLine += 1;
          console.warn(this.currentLine);

          this.currentChange = {
            ...this.currentChange,
            type: 'correct',
            text: 'Enter',
          };

          if (!this.stats.oneThirdTime && this.currentLine === Math.floor(this.codeInfo.lines / 3)) {
            console.green('one third');
            const oneThirdText = this.cm.getRange(
              { line: 0, ch: 0 },
              { line: this.currentLine, ch: 0 },
            );
            console.blue(oneThirdText);

            this.stats.oneThirdCharsCount = oneThirdText.length;
            this.stats.oneThirdTime = this.timeElapsed();
          } else if (!this.stats.lastThirdStartTime && this.currentLine === Math.floor(this.codeInfo.lines / 3 * 2)) {
            const lastThirdText = this.cm.getRange(
              { line: this.currentLine, ch: 0 },
              { line: this.codeInfo.lines + 1, ch: 0 },
            );
            console.blue(lastThirdText);
            this.stats.lastThirdCharsCount = lastThirdText.length;
            this.stats.lastThirdStartTime = this.timeElapsed();
          }

          if (this.options.autoIndent) {
            this.cm.execCommand('goLineStartSmart');
            this.currentChar = this.cm.getCursor().ch;
            this.correctCharsInLine = this.currentChar;
          } else {
            this.currentChar = 0;
            this.correctCharsInLine = 0;
          }
          if (this.options.underScore) {
            let underScoreWidth = 1;
            if (!this.options.autoIndent && this.cm.getLine(this.currentLine).slice(0, this.tabWidth) === Array(this.tabWidth).fill(' ').join('')) {
              underScoreWidth = this.tabWidth;
            }
            this.cm.markText(
              { line: this.currentLine, ch: this.currentChar },
              { line: this.currentLine, ch: this.currentChar + underScoreWidth },
              {
                className: 'next-char', clearOnEnter: true, inclusiveRight: true,
              },
            );
          }
        } else {
          console.error('enter blocked before end of the line');
          this.currentChange = {
            ...this.currentChange,
            type: 'blockedEnter',
          };
        }
      };

      const handleWrite = (key) => {
        const lineText = this.cm.getLine(this.currentLine);
        console.log(`${lineText}1`);
        if (this.currentChar !== lineText.length) { // block too long lines
          let expectedText = lineText[this.currentChar];
          console.blue(`expected: '${expectedText}'`);

          let text = key;

          if (key === 'Tab') {
            text = Array(this.tabWidth).fill(' ').join('');
            console.green(`tabText: '${text}'`);


            if (expectedText === ' ' && this.language.name !== 'Whitespace') {
              console.red(`test: '${lineText.slice(this.currentChart, this.currentChar + this.tabWidth)}'`);
              if (lineText.slice(this.currentChar, this.currentChar + this.tabWidth) === text) {
                console.log('if');
                expectedText = text;
                console.red(`expectedText: '${text}'`);
              }
            } else if (expectedText === '	') { // Tab character
              text = '	';
            }
          }
          console.green(`text: '${text}'`);
          if (text === expectedText) {
            if (this.toFix) {
              console.red(`blocked unfixed mistakes: ${this.toFix}`);
              this.currentChange = {
                ...this.currentChange,
                type: 'unfixed',
                text,
              };
            } else {
              this.cm.markText(
                { line: this.currentLine, ch: this.currentChar },
                { line: this.currentLine, ch: this.currentChar + text.length },
                { className: 'correct' },
              );


              this.currentChar += text.length;
              this.correctCharsInLine += text.length;

              this.currentChange = {
                ...this.currentChange,
                type: 'correct',
                text,
              };

              if (text.length > 1) {
                this.cm.startOperation();
                for (let i = 0; i < text.length; i += 1) {
                  this.cm.execCommand('goCharRight');
                }
                this.cm.endOperation();
              } else {
                this.cm.execCommand('goCharRight');
              }



              if (this.currentLine + 1 === this.codeInfo.lines && this.correctCharsInLine === this.cm.getLine(this.currentLine).length) {
                this.completed();
              } else if (this.options.underScore) {
                if (this.currentChar !== lineText.length) {
                  let underScoreWidth = 1;
                  if (!this.options.autoIndent && this.cm.getLine(this.currentLine).slice(this.currentChar, this.tabWidth + this.currentChar) === Array(this.tabWidth).fill(' ').join('')) {
                    underScoreWidth = this.tabWidth;
                  }
                  this.cm.markText(
                    { line: this.currentLine, ch: this.currentChar },
                    { line: this.currentLine, ch: this.currentChar + underScoreWidth },
                    { className: 'next-char', clearOnEnter: true, inclusiveRight: true },
                  );
                } else {
                  // it can confuse the player
                  // const char = this.cm.getLine(this.currentLine + 1).match('[^\\S]*')[0].length;
                  // this.cm.markText(
                  //   { line: this.currentLine + 1, ch: char },
                  //   { line: this.currentLine + 1, ch: char + 1 },
                  //   { className: 'next-char', clearOnEnter: true, inclusiveRight: true },
                  // );
                }
              }
            }
          } else {
            this.toFix += 1;
            console.red(`wrong: ${this.toFix}`);
            const marker = this.cm.markText(
              { line: this.currentLine, ch: this.currentChar },
              { line: this.currentLine, ch: this.currentChar + text.length },
              { className: 'mistake' },
            );
            // TODO show missclicked char
            this.markers.push(marker);
            this.currentChar += text.length;
            this.currentChange = {
              ...this.currentChange,
              type: 'mistake',
              fixQueuePos: this.toFix,
              expectedText,
              text,
            };

            if (text.length > 1) {
              this.cm.startOperation();
              for (let i = 0; i < text.length; i += 1) {
                this.cm.execCommand('goCharRight');
              }
              this.cm.endOperation();
            } else {
              this.cm.execCommand('goCharRight');
            }
          }
        } else {
          this.currentChange = {
            ...this.currentChange,
            type: 'lineEnd',
          };
          console.red('overshoot');
        }
      };

      if (ev.key === 'Shift' || ev.key === 'CapsLock' || ev.key === 'Alt' || ev.key === 'PageUp' || ev.key === 'PageDown' || ev.key === 'ScrollLock' || ev.ctrlKey || ev.metaKey || ev.key.slice(0, 5) === 'Arrow' || (ev.key.length > 1 && ev.key[0] === 'F')) {
        // prevent double event and block keys
        return;
      }
      if (this.started && !this.stats.firstCharTime) {
        this.stats.firstCharTime = Date.now();
      }
      this.currentChange = {
        time: this.timeElapsed(),
        type: 'initialType',
        shift: ev.shiftKey,
        alt: ev.altKey,
        keyCode: ev.keyCode,
      };



      if (ev.key === 'Escape' || ev.key === 'Pause') {
        this.popUp(true, 'Resume');
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
        this.stats.cheat = true;
      } else if (ev.key === 'End') {
        this.stats.cheat = true;
        this.completed(true);
      } else if (ev.key === 'Home') {
        this.cm.execCommand('goDocEnd');
        this.cm.markText(
          { line: 0, ch: 0 },
          { line: this.codeInfo.lines + 1, ch: 1 },
          { className: 'correct' },
        );
        this.currentLine = this.codeInfo.lines - 1;
        this.currentChar = this.cm.getLine(this.currentLine);
        this.correctCharsInLine = this.currentChar;
        this.stats.cheat = true;
        this.completed(false, false);
      } else if (ev.key === 'Enter') {
        handleEnter();
      } else if (ev.key === 'Backspace') {
        if (this.toFix) {
          this.toFix -= 1;

          // this.cm.execCommand('undo'); // clear marker
          const marker = this.markers.pop();
          console.log(marker);
          const position = marker.find();
          console.log(position);
          marker.clear();

          const markerLength = position.to.ch - position.from.ch;
          if (markerLength > 1) {
            this.cm.startOperation();
            for (let i = 0; i < markerLength; i += 1) {
              this.cm.execCommand('goCharLeft');
            }
            this.cm.endOperation();
          } else {
            this.cm.execCommand('goCharLeft');
          }

          console.blue(`markerLength: ${markerLength}`);

          this.currentChar -= markerLength;
          this.currentChange = {
            ...this.currentChange,
            type: 'backspace',
            fixQueuePos: this.toFix,
          };
          console.blue(`Deleted tofix: ${this.toFix}`);
          if (this.toFix > 0) {
            console.blue('TOFIX > 0');
            if (this.rightMostMistakeMarked) {
              console.blue('middle');
              this.cm.markText(position.from, position.to, { className: 'corrected middle' });
            } else {
              console.blue('rightMost');
              this.cm.markText(position.from, position.to, { className: 'corrected right-most' });
              this.rightMostMistakeMarked = true;
            }
          } else {
            console.green(`TOFIX = 0 ${position.from.ch} ${position.to.ch}`);

            if (this.rightMostMistakeMarked) {
              console.blue('left-most');
              this.rightMostMistakeMarked = false;
              this.cm.markText(position.from, position.to, { className: 'corrected left-most' });
            } else {
              console.blue('alone');

              this.cm.markText(position.from, position.to, { className: 'corrected alone' });
            }



            if (this.options.underScore) {
              let underScoreWidth = 1;
              if (!this.options.autoIndent && this.cm.getLine(this.currentLine).slice(this.currentChar, this.tabWidth + this.currentChar) === Array(this.tabWidth).fill(' ').join('')) {
                underScoreWidth = this.tabWidth;
              }
              this.cm.markText(
                { line: this.currentLine, ch: this.currentChar },
                { line: this.currentLine, ch: this.currentChar + underScoreWidth },
                { className: 'next-char', clearOnEnter: true, inclusiveRight: true },
              );
            }
          }
        } else {
          console.blue('Blocked Nothing to fix');
          this.currentChange = {
            ...this.currentChange,
            type: 'blockedBackspace',
          };
        }
      // } else if (ev.key === 'Tab') {
        // eslint-disable-next-line no-tabs
        // handleWrite('	', ev);
        // for (let i = 0; i < this.tabWidth; i += 1) {
        //   this.cm.startOperation();
        //   handleWrite(' ', ev);
        //   this.cm.endOperation();
        // }
      } else {
        handleWrite(ev.key, ev);
      }

      if (this.currentChange.type !== 'initialType') {
        this.stats.history.push(this.currentChange);
      }
      this.currentChange = {};
    },
    onUnFocus(_, ev) {
      if (process.env.NODE_ENV !== 'production') ev.preventDefault(); // DEV
      // console.red('blur');
      if (!this.isCompleted && ev) {
        if (process.env.NODE_ENV !== 'production') this.cm.focus(); // DEV
        if (ev.relatedTarget !== null) {
          if (ev.relatedTarget.tagName !== 'BUTTON' && ev.relatedTarget.tagName !== 'A') {
            if (process.env.NODE_ENV === 'production') this.popUp(true, 'Resume'); // dev
          } else if (ev.relatedTarget.className === 'disconnect-btn') {
            this.cm.focus();
          }
        } else {
          this.popUp(true, 'Resume');
        }
      }
    },
    fixHeight() {
      const height = `${this.$refs.container.offsetHeight}px`;
      // console.blue(`height: ${height}`);
      const scroll = this.$refs.codemirror.$el.getElementsByClassName('CodeMirror-scroll')[0];
      scroll.style.maxHeight = height;
    },
    async getCode() {
      if (!this.codeInfo.name) {
        return this.customCode.text;
      }
      const url = `${process.env.VUE_APP_ASSETS_PATH || ''}/code/${this.language.name.replace('#', '_sharp')}/${this.codeInfo.name}.${this.language.ext}`;
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
    timeElapsed() {
      return Date.now() - this.stats.firstCharTime;
    },
    start(interval) {
      clearInterval(interval);
      this.cm.markText(
        { line: 0, ch: 0 },
        { line: this.codeInfo.lines + 1, ch: 1 },
        { className: 'bugfix' },
      );
      if (this.options.underScore) {
        this.cm.markText(
          { line: this.currentLine, ch: this.currentChar },
          { line: this.currentLine, ch: this.currentChar + 1 },
          { className: 'next-char', clearOnEnter: true, inclusiveRight: true },
        );
      }
      this.popUp(false, 'WRITE');
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
              this.popUpText = 'Something propably crashed but you can wait a few seconds just in case';
            }
          }
        } else if (this.countdown === 0) {
          this.start(interval);
        }
      }, process.env.NODE_ENV === 'production' ? 500 : 100); // DEV 500


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
    completed(forced = false, currentStats = true) {
      if (this.$route.path === '/results' || (forced && this.stats.history.length < 10)) {
        // return; DEV
      }
      this.cm.setOption('readOnly', 'nocursor');
      this.popUp(true, forced ? 'Too long, uh?' : 'Congratulations');
      if (this.room.connected) {
        this.$socket.client.emit('completed', Date.now());
      }

      if (currentStats) {
        this.stats = {
          ...this.stats,
          timeFromFirstInput: this.timeElapsed(),
          codeLength: this.codeText.length,
          file: this.codeInfo,
        };
        if (forced) {
          this.stats.earlyFinish = true;
        }
      } else {
        this.stats = stats;
      }

      console.log(JSON.parse(JSON.stringify(this.stats)));

      this.$emit('completed', this.stats);
      this.isCompleted = true;
      setTimeout(() => {
        this.$router.replace('/results');
        this.popUp(false);
      }, process.env.NODE_ENV === 'production' ? 2000 : 200); // DEV 2000
    },
  },
};
</script>

<style lang="sass" scoped>
.container
  height: 100%
  position: relative

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
  .CodeMirror-gutters
    border: none
  .CodeMirror-cursor
    border-left: 1px solid #FFCC00
    opacity: 1
    border-right: none

  .CodeMirror-selected
    background: transparent

  .CodeMirror-linenumber
    font-size: 20px
    line-height: 22px
    font-weight: normal

  .CodeMirror-line
    // line-break: anywhere !important

    & > span
      &::after
        display: none

      & > span
        transition: filter 1s ease-out
        filter: grayscale(40%) brightness(80%)
        font-size: 20px
        line-height: 22px
        font-weight: normal

    .correct
      filter: none

    .next-char
      border-bottom: 2px solid white

    .mistake
      background-color: rgba(255, 255, 255, .3)


  .CodeMirror-scroll
    padding-right: .7em

  .CodeMirror-vscrollbar
    &::-webkit-scrollbar
      width: $gap / 2 !important
    &::-webkit-scrollbar-thumb
      background: linear-gradient(to top, $purple-gradient-colors) !important
    &::-webkit-scrollbar-track
      background-color: $grid-color !important
    &::-webkit-scrollbar-corner
      background-color: $grid-color !important


.showInvisibles ::v-deep
  .CodeMirror-line
    & > span::after
      display: inline
    .cm-tab
      position: relative
      width: 2.2em
      &:before
        content: "⇥"
        position: absolute
        top: 0
        bottom: 0
        left: 0
        right: 0
        font-size: 1.3em
        text-align: center
        color: #404F7D
        transform: translateY(-0.1em) scaleX(1.5)


.completed
  pointer-events: auto
  .codemirror ::v-deep

    .CodeMirror-line

      // span > span
      //   transition: filter 1s ease-out 2s

      .next-char
        border-bottom: none

      .corrected
        background-color: lighten($grid-color, 4%)
        opacity: 1
        display: inline-block
        filter: none
        padding: 0.1em 0

        // transition: padding $nav-trans-dur $nav-trans-timing 2s, background-color .4s ease-out 3s

        //maintain that order
        &.alone
          padding: 0.1em 0.2em

        &.left-most
          padding-left: 0.2em

        &.right-most
          padding-right: 0.2em

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
  pointer-events: none
  user-select: none
  z-index: 10
  font-size: 4rem
  opacity: 1
  animation: opacity-enter .7s ease-out forwards
  cursor: default
  text-align: center

  &.hidden
    pointer-events: none
    animation: opacity-leave .4s ease-out forwards .1s

  &.clickable
    pointer-events: all
    h2
      cursor: pointer
  &.small-font
    font-size: 1.5rem

    h2
      max-width: 50vw
      text-align: center

  p
    animation: opacity-enter .5s ease-out forwards .7s
    animation-fill-mode: backwards
    font-size: 2rem
    transform: translateY(4rem)

</style>
