<template>
  <div>
    <div class="search">
      <input
        v-model="searchText"
        type="text"
        placeholder="Search"
        class="searchInput"
        maxlength="12"
        autofocus
        @keydown.enter.stop="selectFirstFromSearch"
      >
      <div>
        <span v-show="searchText && filteredList.length === languagesList.length" class="nothing-found-text">(nothing found)</span>
        <button v-show="searchText" class="clear-btn" @click="clear">
          Clear
        </button>
      </div>
    </div>
    <div ref="languagesList" class="languages list" :class="{'showStats': $route.path === '/'}">
      <button
        :disabled="room.connected && !room.owner"
        class="language random"
        :class="{'selected': language.index === null}"
        @click="selectRandom"
      >
        <span class="language-name">
          Random

        </span>
      </button>
      <label
        v-for="(filteredLanguage, index) in filteredList"
        :key="filteredLanguage.name === 'Loading...' ? index : filteredLanguage.name"
        class="language"
        :class="{'selected':language.index === filteredLanguage.index}"
        :data-index="index"
      >
        <input
          v-model="language"
          type="radio"
          class="language-radio"
          :disabled="room.connected && !room.owner"
          :value="languagesList[filteredLanguage.index]"
          @input="setRoomLanguage"
        >
        <span class="language-name" :class="{'greyed-out': options.codeLength && !filteredLanguage.files.some((code) => code.lines <= 17 )}">{{ filteredLanguage.name.replace('_', ' ') }}</span>
        <span class="stat"><span>{{ filteredLanguage.total || 0 }}</span><fa class="icon" :icon="['fas', 'users']" /></span>
      </label>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { createHelpers } from 'vuex-map-fields';

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
    ...mapGetters(['languagesList', 'room', 'options']),
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
  methods: {
    clear() {
      this.searchText = '';
    },
    selectRandom() {
      const index = Math.floor(Math.random() * this.filteredList.length);
      if (this.filteredList[index].index === this.language.index && this.filteredList.length > 1) {
        this.selectRandom();
      } else {
        if (this.options.codeLength && !this.filteredList[index].files.some((code) => code.lines <= 17)) {
          this.selectRandom();
        }
        this.language = this.filteredList[index];
        if (this.room.owner) {
          this.$socket.client.emit('languageChange', index);
        }
        this.$refs.languagesList.querySelector(`[data-index="${index}"]`).scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        });
      }
    },
    selectFirstFromSearch() {
      if (this.filteredList.length !== 0 && this.filteredList.length < this.languagesList.length) {
        [this.language] = this.filteredList;
      } else {
        this.clear();
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
  margin: 0 $grid-gap
  padding: $grid-gap
  border-bottom: $grid-gap solid $grid-color
  height: 40px


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
  @include cursor-shadow()
  padding: $grid-gap
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))
  grid-gap: $grid-gap
  text-align: center
  overflow-y: auto

  &::-webkit-scrollbar
    width: $gap / 2
  &::-webkit-scrollbar-thumb
    background: linear-gradient(to top, $blue-gradient-colors)
  &::-webkit-scrollbar-track
    background-color: $grid-color

.language-radio
  display: none

.showStats .language:hover
  & > .language-name
    transform: translateX(-25%)
  & > .stat
    opacity: 1

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

  .language-name
    transition: transform .2s ease-in-out
    &.greyed-out
      color: $grey

  .stat
    position: absolute
    right: 1em
    height: 100%
    display: flex
    align-items: center
    justify-content: space-around
    opacity: 0
    color: #ddd
    font-size: 0.9em
    transition: opacity .1s ease-out .1s

    .icon
      margin-left: 1em

  &.selected
    background-position: left
    transition: background 0.3s ease-in-out

</style>
