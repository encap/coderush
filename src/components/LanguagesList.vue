<template>
  <div>
    <div class="search">
      <input
        v-model="searchText"
        type="text"
        placeholder="Search"
        class="searchInput"
        maxlength="12"
      >
      <div>
        <span v-if="searchText && filteredList.length === languagesList.length" class="nothing-found-text">(nothing found)</span>
        <button v-if="searchText" class="clear-btn" @click="clear">
          Clear
        </button>
      </div>
    </div>
    <div ref="languagesList" class="languages list">
      <button
        :disabled="room.connected && !room.owner"
        class="language random"
        :class="{'selected': language.index === null}"
        @click="selectRandom"
      >
        Random
      </button>
      <label
        v-for="(filteredLanguage, index) in filteredList"
        :key="filteredLanguage.name === 'Loading...' ? index : filteredLanguage.name"
        class="language"
        :class="{'selected':language.index === filteredLanguage.index}"
      >
        <input
          v-model="language"
          type="radio"
          class="language-radio"
          :disabled="room.connected && !room.owner"
          :index="filteredLanguage.index"
          :value="languagesList[filteredLanguage.index]"
          @input="setRoomLanguage"
        >
        <span class="stat"><span>41</span><span>WPM</span></span>
        <span class="language-name">{{ filteredLanguage.name.replace('_', ' ') }}</span>
        <span class="stat"><span>24</span><span><fa :icon="['fas', 'play']" /></span></span>
      </label>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { createHelpers } from 'vuex-map-fields';

// The getter and mutation types we're providing
// here, must be the same as the function names we've
// used in the store.
const { mapFields } = createHelpers({
  getterType: 'getLanguage',
  mutationType: 'UPDATE_LANGUAGE',
});
export default {
  data() {
    return {
      searchText: '',
    };
  },
  computed: {
    ...mapGetters(['languagesList', 'room']),
    ...mapFields(['language']),
    filteredList() {
      if (this.languagesList.length) {
        const search = this.searchText.toLowerCase();
        const filtered = this.languagesList
          .filter((language) => language.name.toLowerCase().includes(search))
          .sort((a, b) => (b.name.toLowerCase().startsWith(search) ? 1 : -1));
        return filtered.length > 0 ? filtered : this.languagesList;
      }
      return [...Array(29)].map(() => ({ name: 'Loading...' }));
    },
  },
  activated() {
    this.$store.commit('ADD_TRACKED_CONTAINER', this.$refs.languagesList);
  },
  deactivated() {
    this.$store.commit('REMOVE_TRACKED_CONTAINER', this.$refs.languagesList.className);
  },
  // activated() {
  //   if (this.language.index) {
  //     console.warn('updating selected language');
  //     this.selected = this.language.index;
  //   }
  // },
  methods: {
    clear() {
      this.searchText = '';
    },
    selectRandom() {
      const index = Math.floor(Math.random() * this.filteredList.length);
      if (this.filteredList[index].index === this.language.index && this.filteredList.length > 1) {
        this.selectRandom();
      } else {
        this.language = this.filteredList[index];
        if (this.room.owner) {
          this.$socket.client.emit('languageChange', index);
        }
      }
    },
    setRoomLanguage(ev) {
      if (this.room.owner) {
        this.$nextTick(() => this.$socket.client.emit('languageChange', ev.target.getAttribute('index')));
      }
    },
  },
};
</script>

<style lang="sass" scoped>

.search
  display: flex
  justify-content: space-between
  position: relative
  margin-bottom: $grid-gap
  border-bottom: $grid-gap solid $grid-color
  width: 100%
  height: 40px
  padding: 2 * $grid-gap

  &:focus-within
    border-image: linear-gradient(to right, $light-blue, $grid-color 90%) 1

  input
    max-width: 40%

  input::placeholder, .nothing-found-text
    color: $grey

  div
    overflow: hidden

  .clear-btn
    margin-left: 1em
    background: $navy-grey
    padding: $grid-gap 4 * $grid-gap
    box-shadow: 0px 0px 2px 2px rgba(black, .1)
    height: 100%

.list
  flex-grow: 1
  position: relative
  background: transparent radial-gradient(250px at var(--mouse-x) var(--mouse-y), rgba($white, 0.2) 10%, transparent 90%) no-repeat 0 0
  padding: $grid-gap
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))
  grid-gap: $grid-gap
  text-align: center
  overflow-y: auto

.list
  &::-webkit-scrollbar
    width: $gap / 2
  &::-webkit-scrollbar-thumb
    background: linear-gradient(to bottom, $blue-gradient-colors)

  &::-webkit-scrollbar-track
    background-color: $grid-color

.language-radio
  display: none

.language
  min-height: 40px
  position: relative
  cursor: pointer
  background: $navy-grey
  opacity: 0.95
  box-shadow: 0px 0px 2px 2px rgba(black, .1)
  display: flex
  justify-content: space-around
  align-items: center
  background: linear-gradient(to right, $blue-gradient-colors 49.8%, $grid-color 49.8%)
  background-size: 200%
  background-position: 99.8% 0 // 1px glitch
  transition: background .1s ease-in

  &:hover
    opacity: 0.85

.stat
  padding: 0.2em
  opacity: 0
  color: $grey
  font-size: 0.9em
  width: 3em
  display: flex
  flex-direction: column
  justify-content: space-between

.language:hover > .stat
  opacity: 1

.selected
  background-position: left
  transition: background 0.3s ease-in-out

.selected:hover > .stat
  opacity: 0

</style>
