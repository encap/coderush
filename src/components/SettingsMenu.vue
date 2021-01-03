<template>
  <main @input.capture="updateOption">
    <h2>How do you want to play?</h2>
    <p class="select-text">
      Game mode
    </p>
    <div ref="modesList" class="modes list">
      <label
        v-for="(mode, index) in modesList"
        :key="mode[0]"
        :class="{'selected': index === selectedMode }"
        class="mode"
      >
        <h4>{{ mode[0] }}</h4>
        <p class="modeDesc">{{ mode[1] }}</p>

        <input
          v-model="selectedMode"
          name="selectedMode"
          :value="index"
          type="radio"
        >
      </label>
    </div>
    <p class="select-text">
      Source code theme
    </p>
    <div ref="themesList" class="themes list">
      <label
        v-for="(theme) in themesList"
        :key="theme[0]"
        :class="{'selected': theme[0] === selectedTheme}"
        class="theme"
      >
        <h4>{{ theme[1] }}</h4>
        <input
          v-model="selectedTheme"
          :value="theme[0]"
          type="radio"
        >
      </label>
    </div>
    <div class="toggles">
      <label>
        <span>Underscore the next character</span>
        <input v-model="underScore" type="checkbox">
        <div class="slider" />
      </label>
      <label>
        <span>Auto-indent new line</span>
        <input
          v-model="autoIndent"
          :disabled="block"
          name="autoIndent"
          type="checkbox"
        >
        <div class="slider" />
      </label>
      <label>
        <span>Short texts only</span>
        <input
          v-model="codeLength"
          :disabled="block"
          name="codeLength"
          type="checkbox"
        >
        <div class="slider" />
      </label>
      <label>
        <span>Show line numbers</span>
        <input v-model="lineNumbers" type="checkbox">
        <div class="slider" />
      </label>
    </div>
  </main>
</template>

<script>
import { mapGetters } from 'vuex';
import { createHelpers } from 'vuex-map-fields';

const { mapFields } = createHelpers({
  getterType: 'getOption',
  mutationType: 'UPDATE_OPTION',
});
export default {
  name: 'SettingsMenu',
  data() {
    return {
      themesList: [
        ['material-darker', 'Material Dark'],
        // ['one-dark', 'Atom One Dark'],
        ['vscode-dark', 'Visual Studio Code'],
        ['Base2Tone-Suburb-dark', 'Base2Tone Suburb Dark'],
        ['', 'Plain white'],
      ],
      modesList: [
        ['Normal', 'Write down provided source code as quickly as you can.'],
        ['CodeRush', 'See how much code you are able to write in 100 seconds'],
        ['Hardcore', 'You make a mistake - you lose'],

      ],
    };
  },
  computed: {
    ...mapGetters(['room']),
    ...mapFields(['selectedTheme', 'selectedMode', 'underScore', 'codeLength', 'lineNumbers', 'autoIndent']),
    block() {
      return this.room.connected && !this.room.admin;
    },
  },
  watch: {
    'room.admin': {
      deep: true,
      handler(current) {
        if (current) {
          this.$socket.client.emit('optionsData', {
            selectedMode: this.selectedMode,
            codeLength: this.codeLength,
            autoIndent: this.autoIndent,
          });
        }
      },
    },
  },
  activated() {
    this.$store.commit('ADD_TRACKED_CONTAINER', this.$refs.modesList);
    this.$store.commit('ADD_TRACKED_CONTAINER', this.$refs.themesList);
  },
  deactivated() {
    this.$store.commit('REMOVE_TRACKED_CONTAINER', this.$refs.modesList.className);
    this.$store.commit('REMOVE_TRACKED_CONTAINER', this.$refs.themesList.className);
  },
  methods: {
    updateOption(ev) {
      if (this.room.admin && ev.target.name) {
        const payload = {
          name: ev.target.name,
          value: ev.target.checked,
        };
        if (ev.target.name === 'selectedMode') {
          payload.value = Number(ev.target.value);
        }
        this.$socket.client.emit('optionChange', payload);
      }
    },
  },
};
</script>

<style lang="sass" scoped>
main
  display: flex
  justify-content: flex-start
  flex-direction: column
  height: 100%

h2
  margin: $thin-gap 0 $thin-gap $thin-gap

.select-text
  color: $grey
  margin: 1em 2 * $thin-gap $thin-gap 0
  text-align: right

.list
  @include cursor-shadow()
  display: grid
  padding: $thin-gap
  margin-bottom: $gap
  overflow-x: auto
  text-align: center
  grid-gap: $thin-gap

  &::-webkit-scrollbar
    width: $gap / 2
  &::-webkit-scrollbar-thumb
    background: linear-gradient(to left, $purple-gradient-colors)
  &::-webkit-scrollbar-track
    background-color: $navy-grey
  &::-webkit-scrollbar-corner
    background-color: $navy-grey

  label
    display: flex
    align-items: center
    flex-direction: column
    position: relative
    background: linear-gradient(to right, $purple, $dark-pink 49.8%, $navy-grey 49.8% 100%)
    background-position: 99.8% 0 // 1px glitch
    background-size: 200%
    box-shadow: 0px 0px 2px 2px rgba(black, .1)
    cursor: pointer
    padding: $thin-gap
    opacity: 0.95
    transition: background .2s ease-in
    // min-height: 40px

    h4
      font-weight: normal

  .selected
    background-position: left
    transition: background .4s ease-in-out

.modes
  flex-grow: 1
  flex-shrink: 1
  max-height: 250px
  grid-template-columns: repeat(3, 1fr)

  label
    padding: 30% 0.5em 0.5em
    height: 100%

    .modeDesc
      font-size: 0.9em
      color: #bbb
      padding: 20% 0
      text-align: center
      width: 80%
      transition: color 1s ease

  .selected > .modeDesc
    color: #ddd


.themes
  flex-shrink: 0
  grid-template-rows: 50px 50px
  grid-template-columns: repeat(2, 1fr)

  label
    justify-content: space-around

.toggles
  display: flex
  flex-direction: column
  flex-grow: 2
  flex-shrink: 2
  position: relative
  padding: 0 3 * $thin-gap 0 2 * $thin-gap
  overflow-y: auto
  width: 100%

  &::-webkit-scrollbar
    width: $gap / 2
  &::-webkit-scrollbar-thumb
    background: linear-gradient(to top, $purple-gradient-colors)
  &::-webkit-scrollbar-track
    background-color: $navy-grey
  &::-webkit-scrollbar-corner
    background-color: $navy-grey


  label
    display: flex
    justify-content: space-between
    position: relative
    cursor: pointer
    margin: 2vh 0
    width: 100%

  $width: 70px
  $trans-duration: .15s
  .slider
    @include shadow(0.5)
    position: relative
    background: linear-gradient(to right, $purple, $dark-pink 50%, $grey 50% 100%)
    background-position: right
    background-size: 200%
    width: $width
    height: 20px
    transition: background $trans-duration ease-in-out, transform 0.07s ease-in-out

  .slider:after
    @include shadow()
    content: ''
    position: absolute
    top: -2px
    left: -0.5rem
    background-color: white
    width: 1rem
    height: 24px
    transition: transform $trans-duration ease-in-out
    z-index: 3

  input:active + .slider:after
    transform: scale(0.75)

  input:checked + .slider
    background-position: left

  input:checked + .slider:after
    transform: translateX($width)

@media (max-height: 700px)
  .toggles
    label
      margin: 0.5rem 0
  .list
    margin-bottom: 1em
</style>
