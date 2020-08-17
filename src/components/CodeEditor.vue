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
          if (this.options.autoIndent) {
            this.cm.execCommand('goLineStartSmart');
            this.currentChar = this.cm.getCursor().ch;
            this.correctCharsInLine = this.currentChar;
          } else {
            this.currentChar = 0;
            this.correctCharsInLine = 0;
          }
          if (this.options.underScore) {
            this.cm.markText(
              { line: this.currentLine, ch: this.currentChar },
              { line: this.currentLine, ch: this.currentChar + 1 },
              {
                className: 'next-char', clearOnEnter: true, inclusiveRight: true,
              },
            );
          }
        }
      };

      const handleWrite = (key) => {
        const lineText = this.cm.getLine(this.currentLine);
        if (this.currentChar !== lineText.length) { // block too long lines
          const expectedChar = lineText[this.currentChar];
          console.blue(`expected: '${expectedChar}'`);
          if (key === expectedChar) {
            console.green(`correct '${key}'`);
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
              } else if (this.options.underScore) {
                if (this.currentChar !== lineText.length) {
                  this.cm.markText(
                    { line: this.currentLine, ch: this.currentChar },
                    { line: this.currentLine, ch: this.currentChar + 1 },
                    { className: 'next-char', clearOnEnter: true, inclusiveRight: true },
                  );
                } else {
                  // it can confuse the playerinp
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
              { line: this.currentLine, ch: this.currentChar + 1 },
              { className: 'mistake' },
            );
            this.markers.push(marker);
            this.cm.execCommand('goCharRight');
            this.currentChar += 1;
          }
        } else {
          console.red('overshoot');
        }
      };

      if (ev.key === 'Shift' || ev.key === 'Alt' || ev.ctrlKey || ev.metaKey || ev.key.slice(0, 5) === 'Arrow') {
        // prevent double event and block keys
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
          // this.cm.execCommand('undo'); // clear marker
          const marker = this.markers.pop();
          console.log(marker);
          marker.className = 'mark';
          const position = marker.find();
          this.cm.markText(position.from, position.to, { className: 'correctedMistake' });
          marker.clear();
          this.currentChar -= 1;
          console.blue(`Deleted tofix: ${this.toFix}`);
          if (this.toFix === 0 && this.options.underScore) {
            this.cm.markText(
              { line: this.currentLine, ch: this.currentChar },
              { line: this.currentLine, ch: this.currentChar + 1 },
              {
                className: 'next-char', clearOnEnter: true, inclusiveRight: true,
              },
            );
          }
        } else {
          console.blue('Blocked Nothing to fix');
        }
      } else if (ev.key === 'Tab') {
        for (let i = 0; i < this.tabWidth; i += 1) {
          this.cm.startOperation();
          handleWrite(' ', ev);
          this.cm.endOperation();
        }
      } else {
        handleWrite(ev.key, ev);
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
      const height = `${this.$refs.code.offsetHeight}px`;
      console.blue(`height: ${height}`);
      const scroll = this.$refs.codemirror.$el.getElementsByClassName('CodeMirror-scroll')[0];
      console.log(scroll);
      scroll.style.maxHeight = height;
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
      this.cm.setOption('readOnly', 'nocursor');
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

    generateHeatMap() {
      // const arr = this.stats.history;
      // for (let i = 1; i < arr.length; i += 1) {
      //   let from;
      //   let to;
      //   if (arr[i].type === 'mistake') {
      //     from = arr[i].position.from;
      //     for (let j = i + 1; j < arr.length; j += 1) {
      //       if (arr[j].type !== 'mistake') {
      //         to = arr[j - 1].position.to;
      //         i = j;
      //         break;
      //       }
      //     }
      //     this.cm.markText(from, to, { className: 'mistake' });
      //     console.log(this.cm.getAllMarks);
      //   }
      // }
      // // console.log('heatmap ready', this.timeElapsed());
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
  .CodeMirror

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

    span > span
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



.completed
  .codemirror ::v-deep

    .mistake
      background-color: transparent
      transition: margin $nav-trans-dur $nav-trans-timing, padding $nav-trans-dur $nav-trans-timing, background-color .5s ease-out 1s, box-shadow .5s ease-out 1s



.heatMap
  pointer-events: auto

  .codemirror
    ::v-deep
      .correctedMistake
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
