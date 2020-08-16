<template>
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
      keyboard: [
        [
          { keyCode: 192, content: ['`', '~'] },
          { keyCode: 49, content: ['1', '!'] },
          { keyCode: 50, content: ['2', '@'] },
          { keyCode: 51, content: ['3', '#'] },
          { keyCode: 52, content: ['4', '$'] },
          { keyCode: 53, content: ['5', '%'] },
          { keyCode: 54, content: ['5', '^'] },
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
      console.log(JSON.parse(JSON.stringify(this.mistakesHistory)));
      return this.mistakesHistory.map((mistake) => ({
        keyCode: mistake.keyCode,
        key: mistake.key,
        shift: mistake.shift,
        expectedText: mistake.expectedText,
      })).reduce((acc, mistake) => {
        if (
          mistake.shift
        && mistake.expectedText !== ' '
        && (mistake.key.toLowerCase() === mistake.expectedText || !Number.isNaN(mistake.expectedText))) {
          acc.push({
            keyCode: 16,
            key: 'Shift',
            expectedText: mistake.expectedText,
            text: mistake.text,
          });
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
      // console.log('MARK');
      Object.keys(this.keyStats).forEach((keyCode) => {
        const keyEl = document.getElementById(keyCode);

        const { count } = this.keyStats[keyCode];
        keyEl.style.setProperty('--wrong-count', count);
        keyEl.setAttribute('wrong-count', count);
      });
    },
    showExpectedKeys(ev) {
      if (ev.target && ev.target.getAttribute('wrong-count')) {
        // debounce
        if (this.timeout) window.clearTimeout(this.timeout);
        this.timeout = window.setTimeout(() => {
          if (ev.target.matches(':hover')) {
            // console.log('SHOW');
            const originKeyCode = ev.target.id;
            if (!this.stayOnLeave[originKeyCode]) {
              const expectedKeysCodes = this.keyStats[originKeyCode].expected;

              // console.log(`hovered ${originKeyCode}: ${expectedKeysCodes}`);
              expectedKeysCodes.forEach((keyCode) => {
                const keyEl = document.getElementById(keyCode);
                let currentValue = Number(keyEl.getAttribute('expected-count'));
                currentValue += 1;
                console.log('incrementing ', currentValue);
                keyEl.setAttribute('expected-count', currentValue);
                keyEl.style.setProperty('--expected-count', currentValue);
              });
            }
            this.timeout = undefined;
          }
        }, 50);
      }
    },
    hideExpectedKeys(ev) {
      if (ev.target.getAttribute('wrong-count') && !this.timeout) {
        const originKeyCode = ev.target.id;
        if (!this.stayOnLeave[originKeyCode]) {
          // console.log('Hiding');
          const expectedKeysCodes = this.keyStats[originKeyCode].expected;
          expectedKeysCodes.forEach((keyCode) => {
            const keyEl = document.getElementById(keyCode);
            let currentValue = Number(keyEl.getAttribute('expected-count'));
            // console.log('decrementing ', currentValue);
            currentValue -= 1;
            if (currentValue === 0) {
              keyEl.removeAttribute('expected-count');
            } else {
              keyEl.setAttribute('expected-count', currentValue);
            }
            keyEl.style.setProperty('--expected-count', currentValue);
          });
        } else {
          // console.log('staying');
        }
      }
    },
    changeLeaveAction(ev) {
      const keyCode = ev.target.id;
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
    },
    generatekeyStats() {
      // console.warn('GeneratekeyStats');
      const keys = {};
      this.keyboard.forEach((row) => {
        row.forEach((key) => {
          if (key.keyCode) {
            const stats = this.mistakes.reduce((acc, mistake) => {
              if (mistake.keyCode === key.keyCode) {
                const text = mistake.expectedText;
                acc.count += 1;
                if (
                  !mistake.shift
                  && ((key.content.length === 2
                      && key.content[0].toUpperCase() === text)
                    || (key.content.length === 1
                      && key.content.toUpperCase() === text)
                  )) {
                  acc.expected.push('16');
                } else {
                  const keyEl = this.$refs.keyboard
                    .querySelector(`[id][content*="${text}" i]`);
                  // console.log(keyEl);
                  // console.assert(keyEl.id);
                  acc.expected.push(keyEl.id);
                }
              }
              return acc;
            }, { expected: [], count: 0 });
            if (stats.expected.length) {
              // console.log(`'${key.content.length === 2 ? key.content[0] : key.content}' ${key.keyCode}\nExpected:`);
              // console.log(stats.expected);
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
.keyboard
  margin: 0 auto
  display: flex
  flex-direction: column
  justify-content: space-around
  font-size: 1rem
  --min-size: 4vw
  --key-margin: .1rem
  --key-size: calc(var(--min-size) + var(--key-margin) * 2)
  --bg-color: #2c2137
  min-width: calc(15 * var(--key-size))
  height: calc(5 * var(--key-size))
  background: transparent radial-gradient(200px 100px at var(--mouse-x) var(--mouse-y), rgba(180, 180, 180, 0.5),transparent ) no-repeat 0 0


.row
  text-align: center
  position: relative
  width: 100%
  display: flex
  height: 0
  margin: var(--key-margin) 0
  flex-grow: 1
  align-items: center


.key
  height: 100%
  cursor: pointer
  user-select: none
  flex-shrink: 0
  flex-basis: 0
  margin: 0 var(--key-margin)
  padding: 0.4rem
  background: var(--bg-color)
  display: flex
  flex-direction: column
  justify-content: space-around
  border: 1px solid rgba(110, 110, 110, 0.3)
  transition: background-color 0.3s cubic-bezier(0,.5,1,1), color 0.3s cubic-bezier(0,.5,1,1), transform .1s ease-out


span
  pointer-events: none


.key:hover
  opacity: .9


.key:active
  background: white
  color: rgba(43, 30, 51, 1) !important
  transform: scale(.96)


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

[wrong-count]
  background: $accent1
  filter: unquote("saturate(calc(var(--wrong-count) * 20% + 60%))")

[expected-count]
  --color: calc(var(--expected-count) * 40 + 190)
  background: rgba(var(--color),var(--color),var(--color), 0.6)
  color: rgb(43, 30, 51) !important

[wrong-count][expected-count]
   background: rgba(calc(var(--color) + 20), calc(var(--color) - 30), calc(var(--color) + 50), 1)


.locked
  outline: 2px solid var(--accent2)

</style>
