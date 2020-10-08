<template>
  <div class="container">
    <h4 :class="{hide: playersArray.length <= 1}" class="players-count">
      <template v-if="readyPlayersCount === playersArray.length || finishedPlayersCount === playersArray.length">
        <span>All </span>
      </template>
      <template v-else>
        <span v-show="$route.path !== '/results'">{{ playersArray.length - readyPlayersCount }}</span>
        <span v-show="$route.path === '/results'">{{ finishedPlayersCount }}</span>
        <span> out of </span>
      </template>
      <span>{{ playersArray.length === 1 ? '1 player' : playersArray.length + ' players' }}</span>
      <span v-show="$route.path === '/results'"> {{ finishedPlayersCount === 1 ? 'has' : 'have' }} finished</span>
      <span v-show="$route.path !== '/results'"> {{ playersArray.length - readyPlayersCount === 1 ? 'is' : 'are' }}{{ readyPlayersCount !== playersArray.length ? 'n\'t' : '' }} ready</span>
    </h4>
    <ol :class="{'un-ordered': $route.path !== '/results', makeSpace: playersArray.length > 1}">
      <li
        v-for="(player, index) in sortedPlayers"
        :key="player.name"
        :class="{inGame: !player.place, gap: $route.path === '/results' && index === finishedPlayersCount}"
      >
        <span class="bullet">{{ $route.path == '/results' && player.place ? `${index + 1}.` : '•' }}</span>
        <div class="item-wrapper">
          <div class="name-icons">
            <span class="player-name" :class="{ me: player.name === room.myName}">
              {{ player.name }}
            </span>
            <div class="icons">
              <fa
                v-if="player.owner && $route.path !== '/results'"
                class="icon"
                :icon="['fas', 'user-cog']"
                size="xs"
              />
              <fa
                v-show="player.inLobby && player.ready && !player.owner"
                class="icon"
                :icon="['fas', 'check']"
                size="xs"
              />
              <fa
                v-show="($route.path === '/results' && !player.place) || ($route.path !== '/results' && !player.inLobby && !player.owner)"
                class="icon"
                :icon="['fas', 'hourglass-end']"
                size="xs"
              />
              <!-- <fa
                  v-if="$route.path === '/results' && player.place === 1"
                  class="icon"
                  :icon="['fas', 'crown']"
                  size="xs"
                /> -->
              <fa
                v-show="player.connected"
                class="icon"
                :icon="['fas', 'signal']"
                size="xs"
              />
              <faStack v-show="!player.connected" class="icon">
                <fa :icon="['fas', 'slash']" size="xs" />
                <fa :icon="['fas', 'signal']" size="xs" />
              </faStack>
            </div>
          </div>

          <div v-if="$route.path === '/results'" class="results">
            <template v-if="player.place">
              <output>{{ player.stats.wpm }} WPM</output>

              <output v-if="options.selectedMode === 1">{{ player.stats.minutes ? `${player.stats.minutes}min ${player.stats.seconds}s` : `${player.stats.seconds}s` }} </output>

              <output v-else>{{ player.stats.correct }} correct</output>
            </template>
          <!-- <span v-else>In game</span> -->
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'PlayersList',
  computed: {
    ...mapGetters(['room', 'players', 'options']),
    playersArray() {
      return Object.values(this.players);
    },
    sortedPlayers() {
      console.log('players list update');

      // dont mutate original
      return [...this.playersArray].sort((p1, p2) => {
        console.log(p1.name, p2.name);
        if (p1.place && p2.place) {
          if (this.options.selectedMode === 1) {
            return p1.place - p2.place;
          }
          return p2.stats.correct - p1.stats.correct;
        }
        if (p1.owner) {
          console.log('owner');
          return -1;
        }
        if (this.$route.path === '/results') {
          return 1;
        }
        return 0;
      });
    },
    finishedPlayersCount() {
      return this.sortedPlayers.filter((player) => player.place > 0).length;
    },
    readyPlayersCount() {
      return this.playersArray.filter((player) => player.ready).length;
    },
  },
};
</script>

<style lang="sass" scoped>
.container
  position: relative
  display: flex
  flex-direction: column
  justify-content: flex-start

.players-count
  font-weight: normal
  margin: 1em 0
  &.hide
    opacity: 0


ol
  list-style: none
  position: absolute
  top: 1em
  right: -7px
  bottom: 0
  left: 0
  overflow-y: auto
  padding-right: 7px
  &::-webkit-scrollbar
    width: 3px
  &::-webkit-scrollbar-thumb
    background-color: #ddd
  &::-webkit-scrollbar-track
    background-color: #aaa


  &.makeSpace
    top: 3em

  &.un-ordered .bullet, .inGame .bullet
    margin-right: 0.6em


  li
    display: flex
    flex-wrap: wrap
    min-width: 100%
    margin-bottom: 1em
    &:last-child
      margin-bottom: 0

    &.gap
      margin-top: 3em

    .bullet
      margin-right: 0.2em

    .item-wrapper
      flex-grow: 1
      display: flex
      flex-wrap: wrap
      position: relative

      .name-icons
        flex-grow: 1
        display: inline-flex
        justify-content: space-between

        .player-name
          text-overflow: ellipsis
          &.me
            font-weight: bold


        .icon
          margin-left: 1em

      .results
        min-width: 100%
        margin-top: 0.2em
        // padding-left: 1.2rem
        display: flex
        justify-content: space-between







</style>
