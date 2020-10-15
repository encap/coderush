<template>
  <div class="container">
    <div class="info">
      <p>This keyboard shows what keys you have pressed by mistake (if the Shift key is also purple, it means that it was pressed when it should not have been). If you hover over them, the keys that you were supposed to press will be highlighted and the number of such events will be displayed in the lower right corner.</p>
      <div class="buttons">
        <button class="show-expected" @click="toggleExpected">
          {{ showExpected ? 'Hide' : 'Show' }} expected
        </button>
        <button class="reset" @click="reset">
          Reset
        </button>
      </div>
    </div>
    <div ref="keyboard" class="keyboard">
      <div
        v-for="(rowData, rowNumber) in keyboard"
        :key="`row-${rowNumber}`"
        class="row"
      >
        <div
          v-for="(keyData, keyNumber) in rowData"
          :id="keyData.keyCode"
          :key="`key-${keyNumber}`"
          class="key"
          :class="[
            rowNumber === keyboard.length-1 || keyData.class ? 'special' : 'square',
            keyData.class,
          ]"
          :content="Array.isArray(keyData.content) ? keyData.content.join('') : keyData.content"
          @mouseover="showExpectedKeys"
          @click.self="changeLeaveAction"
          @mouseleave="hideExpectedKeys"
        >
          <template v-if="Array.isArray(keyData.content)">
            <span
              v-for="(character, index) in [...keyData.content].reverse()"
              :key="index"
              :class="index === 0 ? 'secondary' : ''"
            >
              {{ character }}
            </span>
          </template>
          <template v-else>
            <span>{{ keyData.content }}</span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'VirtualKeyboard',
  props: {
    history: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      keyStats: {},
      stayOnLeave: {},
      element: null,
      timeout: 0,
      showExpected: false,
      keyboard: [
        [
          { keyCode: 192, content: ['`', '~'] },
          { keyCode: 49, content: ['1', '!'] },
          { keyCode: 50, content: ['2', '@'] },
          { keyCode: 51, content: ['3', '#'] },
          { keyCode: 52, content: ['4', '$'] },
          { keyCode: 53, content: ['5', '%'] },
          { keyCode: 54, content: ['6', '^'] },
          { keyCode: 55, content: ['7', '&'] },
          { keyCode: 56, content: ['8', '*'] },
          { keyCode: 57, content: ['9', '('] },
          { keyCode: 48, content: ['0', ')'] },
          { keyCode: 189, content: ['-', '_'] },
          { keyCode: 187, content: ['=', '+'] },
          { class: 'backspace right', content: 'Backspace' },
        ],
        [
          { class: 'tab left', content: 'Tab' },
          { keyCode: 81, content: 'Q' },
          { keyCode: 87, content: 'W' },
          { keyCode: 69, content: 'E' },
          { keyCode: 82, content: 'R' },
          { keyCode: 84, content: 'T' },
          { keyCode: 89, content: 'Y' },
          { keyCode: 85, content: 'U' },
          { keyCode: 73, content: 'I' },
          { keyCode: 79, content: 'O' },
          { keyCode: 80, content: 'P' },
          { keyCode: 219, content: ['[', '{'] },
          { keyCode: 221, content: [']', '}'] },
          { keyCode: 220, class: 'backslash', content: ['\\', '|'] },
        ],
        [
          { class: 'caps-lock left', content: 'Caps Lock' },
          { keyCode: 65, content: 'A' },
          { keyCode: 83, content: 'S' },
          { keyCode: 68, content: 'D' },
          { keyCode: 70, content: 'F' },
          { keyCode: 71, content: 'G' },
          { keyCode: 72, content: 'H' },
          { keyCode: 74, content: 'J' },
          { keyCode: 75, content: 'K' },
          { keyCode: 76, content: 'L' },
          { keyCode: 186, content: [';', ':'] },
          { keyCode: 222, content: ['\'', '"'] },
          { class: 'enter right', content: 'Enter' },
        ],
        [
          { keyCode: 16, class: 'shift left', content: 'Shift' },
          { keyCode: 90, content: 'Z' },
          { keyCode: 88, content: 'X' },
          { keyCode: 67, content: 'C' },
          { keyCode: 86, content: 'V' },
          { keyCode: 66, content: 'B' },
          { keyCode: 78, content: 'N' },
          { keyCode: 77, content: 'M' },
          { keyCode: 188, content: [',', '<'] },
          { keyCode: 190, content: ['.', '>'] },
          { keyCode: 191, content: ['/', '?'] },
          { class: 'shift right', content: 'Shift' },
        ],
        [
          { content: 'Ctrl' },
          { content: 'Win' },
          { content: 'FN' },
          { content: 'Alt' },
          { keyCode: 32, class: 'space', content: ' ' },
          { content: 'Alt' },
          { content: 'FN' },
          { content: 'Ctrl' },
        ],
      ],
    };
  },
  computed: {
    mistakesHistory() {
      return this.history.filter((change) => change.type === 'mistake');
    },
    mistakes() {
      return this.mistakesHistory.reduce((acc, mistake) => {
        if (mistake.shift && mistake.expectedText !== ' ') {
          if (mistake.text.toLowerCase() === mistake.expectedText
          || (mistake.text.match(/[~!@#$%^&*()_+{}:"|<>?]/)
            && mistake.expectedText.match(/[`1234567890-=[\];'\\,./]/)
          )) {
            // console.log(`Shift Wasn't needed: '${mistake.text}' '${mistake.expectedText}'`);

            acc.push({
              keyCode: 16,
              key: 'Shift',
              expectedText: mistake.expectedText,
              text: mistake.text,
            });
          } else if (mistake.text === mistake.expectedText.toLowerCase()
          || (mistake.text.match(/[`1234567890-=[\];'\\,./]/)
            && mistake.expectedText.match(/[~!@#$%^&*()_+{}:"|<>?]/)
          )) {
            // console.log(`Shift Expected: '${mistake.text}' '${mistake.expectedText}'`);
            acc.push({
              ...mistake,
              expectedText: 'Shift',
            });
          } else {
            acc.push(mistake);
          }
        } else {
          acc.push(mistake);
        }
        return acc;
      }, []);
    },
  },
  mounted() {
    this.keyStats = this.generatekeyStats();
    this.markWrongKeys();
    this.$store.commit('ADD_TRACKED_CONTAINER', this.$refs.keyboard);
  },
  beforeDestroy() {
    this.$store.commit('REMOVE_TRACKED_CONTAINER', this.$refs.keyboard.className);
  },
  methods: {
    markWrongKeys() {
      Object.keys(this.keyStats).forEach((keyCode) => {
        const keyEl = document.getElementById(keyCode);

        const { count } = this.keyStats[keyCode];
        keyEl.style.setProperty('--wrong-count', count);
        keyEl.setAttribute('wrong-count', count);
      });
    },
    showExpectedKeys(ev) {
      if (ev.target && ev.target.getAttribute('wrong-count') && !this.showExpected) {
        // debounce
        if (this.timeout) window.clearTimeout(this.timeout);
        this.timeout = window.setTimeout(() => {
          if (ev.target.matches(':hover')) {
            const originKeyCode = ev.target.id;
            // console.green(!this.stayOnLeave[originKeyCode]);
            if (!this.stayOnLeave[originKeyCode]) {
              const expectedKeysCodes = this.keyStats[originKeyCode].expected;

              // console.log(`Hovered "${originKeyCode}" expected "${expectedKeysCodes}"`);
              expectedKeysCodes.forEach((keyCode) => {
                const keyEl = document.getElementById(keyCode);
                let currentValue = Number(keyEl.getAttribute('expected-count'));
                currentValue += 1;
                // console.log(`incrementing "${keyCode}", value: ${currentValue}`);
                keyEl.setAttribute('expected-count', currentValue);
              });
            }
            this.timeout = undefined;
          }
        }, 50);
      }
    },
    hideExpectedKeys(ev) {
      if (ev.target.getAttribute('wrong-count') && !this.timeout && !this.showExpected) {
        const originKeyCode = ev.target.id;
        if (!this.stayOnLeave[originKeyCode]) {
          const expectedKeysCodes = this.keyStats[originKeyCode].expected;
          expectedKeysCodes.forEach((keyCode) => {
            const keyEl = document.getElementById(keyCode);
            let currentValue = Number(keyEl.getAttribute('expected-count'));
            // console.log(`decrementing "${keyCode}", value: ${currentValue}`);
            currentValue -= 1;
            if (currentValue === 0) {
              keyEl.removeAttribute('expected-count');
            } else {
              keyEl.setAttribute('expected-count', currentValue);
            }
          });
        } else {
          // console.log(`StayOnLeave ${originKeyCode}`);
        }
      }
    },
    changeLeaveAction(ev) {
      const keyCode = ev.target.id;
      if (this.keyStats[keyCode]) {
        if (this.stayOnLeave[keyCode] !== undefined) {
          this.stayOnLeave[keyCode] = !this.stayOnLeave[keyCode];
        } else {
          this.stayOnLeave[keyCode] = true;
        }
        if (this.stayOnLeave[keyCode]) {
          ev.target.classList.add('locked');
        } else {
          ev.target.classList.remove('locked');
        }
      }
    },
    reset() {
      this.$refs.keyboard.querySelectorAll('[expected-count]').forEach((el) => {
        el.removeAttribute('expected-count');
      });
      this.$refs.keyboard.querySelectorAll('.locked').forEach((el) => {
        el.classList.remove('locked');
        this.stayOnLeave[el.id] = false;
      });
      this.showExpected = false;
    },
    toggleExpected() {
      // if (this.showExpected) {
      //   this.$refs.keyboard.querySelectorAll('[expected-count]').forEach((el) => {
      //     console.log('reset', el);
      //     el.removeAttribute('expected-count');
      //   });
      // } else {
      Object.keys(this.keyStats).forEach((wrongKeyCode) => {
        if (!this.stayOnLeave[wrongKeyCode]) {
          const expectedKeysCodes = this.keyStats[wrongKeyCode].expected;

          expectedKeysCodes.forEach((keyCode) => {
            const keyEl = document.getElementById(keyCode);
            let currentValue = Number(keyEl.getAttribute('expected-count'));
            if (this.showExpected) {
              currentValue -= 1;
            } else {
              currentValue += 1;
            }
            // console.log(`incrementing "${keyCode}", value: ${currentValue}`);
            if (currentValue < 1) {
              keyEl.removeAttribute('expected-count');
            } else {
              keyEl.setAttribute('expected-count', currentValue);
            }
          });
        }
      });
      // }
      this.showExpected = !this.showExpected;
    },
    generatekeyStats() {
      const keys = {};
      this.keyboard.forEach((row) => {
        row.forEach((key) => {
          if (key.keyCode) {
            const stats = this.mistakes.reduce((acc, mistake) => {
              if (mistake.keyCode === key.keyCode) {
                const text = mistake.expectedText;
                acc.count += 1;
                const keyEl = this.$refs.keyboard
                  .querySelector(`[id][content*="${CSS.escape(text)}" i]`);
                if (keyEl) {
                  acc.expected.push(keyEl.id);
                }
              }
              return acc;
            }, { expected: [], count: 0 });
            if (stats.expected.length) {
              keys[key.keyCode] = stats;
            }
          }
        });
      });
      return keys;
    },
  },
};
</script>
<style lang="sass" scoped>
.info
  display: flex
  align-items: flex-end
  justify-content: space-between
  position: relative
  padding: 0 $grid-gap
  margin: 1em 0
  align-itemes: center

  p
    font-size: 1.1em
    max-width: 60%
    min-width: 50%

  .buttons
    display: flex
    align-items: flex-end
    justify-content: flex-end
    flex-basis: 100%
    flex-grow: 1
    flex-wrap: wrap
    position: relative
    margin-left: 2em
    min-width: 150px


  button
    background: $grid-color
    padding: 0 0.5em
    margin: $grid-gap 0 0 1em
    text-align: center
    width: 100%
    height: 47px
    max-width: 350px


.keyboard
  @include cursor-shadow()
  display: flex
  justify-content: space-around
  flex-direction: column
  font-size: 1rem
  padding: $grid-gap / 2
  margin: 0 auto
  height: calc(5 * var(--key-size))
  min-width: calc(15 * var(--key-size))
  --key-size: calc(var(--min-size) + var(--key-margin) * 2)
  --key-margin: #{$grid-gap / 2}
  --min-size: 4vw


.row
  display: flex
  align-items: center
  flex-grow: 1
  position: relative
  margin: var(--key-margin) 0
  text-align: center
  width: 100%
  height: 0


.key
  display: flex
  justify-content: space-around
  flex-basis: 0
  flex-direction: column
  flex-shrink: 0
  position: relative
  background: $grid-color
  padding: 0.4rem
  margin: 0 var(--key-margin)
  height: 100%
  transition: background-color 0.3s cubic-bezier(0,.5,1,1), color 0.3s cubic-bezier(0,.5,1,1), transform .1s ease-out
  user-select: none

  &[wrong-count]
    cursor: pointer

  &:hover:not([expected-count])
    opacity: .9


  &[wrong-count]:active
    transform: scale(.98)
[wrong-count]
  background: $accent1
  filter: unquote("saturate(calc(var(--wrong-count) * 0.3 + 0.7))")

  &:hover::before, &[expected-count]:before, &.locked:before
    content: attr(wrong-count)
    position: absolute
    left: $grid-gap
    bottom: $grid-gap
    font-size: 0.8em


[expected-count]
  background: transparentize(white, 0.15)
  & > span, &:after, &:before
    color: $grid-color

[expected-count]:after
  content: attr(expected-count)
  position: absolute
  right: $grid-gap
  bottom: $grid-gap
  font-size: 0.8em

.locked
  @include shadow(0.8, 15px)
  transform: scale(1.02)
  z-index: 1
  &[wrong-count]:not([expected-count])
    transform: scale(1.05)
    z-index: 2


span
  pointer-events: none

.square
  flex-grow: 1

.tab
  flex-grow: 1.4

.caps-lock
  flex-grow: 1.7

.shift.left
  flex-grow: 2.1

.row:last-child > .special:not(.space)
  flex-grow: 1.4

.backspace
  flex-grow: 2

.backslash
  flex-grow: 1.6

.enter
  flex-grow: 2.3

.shift.right
  flex-grow: 2.9

.space
  flex-grow: 5.2


.secondary
  color: #bbb


.left > span, .right > span
  align-self: flex-start


.right > span
  align-self: flex-end


.special > span
  font-size: 0.75rem

</style>
