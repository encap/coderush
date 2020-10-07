<template>
  <div class="container">
    <!-- <h3>{{ room.connected ? 'Connected' : 'Disconnected' }} -- Room {{ room.name }}</h3> -->
    <h4 v-show="playersArray.length > 1" class="players-count">
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
    <div class="list-container">
      <ol :class="{'un-ordered': $route.path !== '/results'}">
        <li
          v-for="(player, index) in sortedPlayers"
          :key="player.name"
          :class="{inGame: !player.place, gap: $route.path === '/results' && index === finishedPlayersCount}"
        >
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
                <output class="wpm">{{ player.stats.wpm }} WPM</output>

                <output class="time">{{ player.stats.minutes ? `${player.stats.minutes}min ${player.stats.seconds}s` : `${player.stats.seconds}s` }} </output>
              </template>
            <!-- <span v-else>In game</span> -->
            </div>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'PlayersList',
  computed: {
    ...mapGetters(['room', 'players']),
    playersArray() {
      return Object.values(this.players);
    },
    sortedPlayers() {
      console.log('players list update');

      // dont mutate original
      return [...this.playersArray].sort((p1, p2) => {
        console.log(p1.name, p2.name);
        if (p1.place && p2.place) {
          return p1.place - p2.place;
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
  methods: {
  },
};
</script>

<style lang="sass" scoped>
.container
  display: flex
  flex-direction: column
  justify-content: flex-start

.players-count
  font-weight: normal
  margin: 1em 0

.list-container
  overflow-y: auto
  padding-right: 2px
  &::-webkit-scrollbar
    width: 2px
  &::-webkit-scrollbar-thumb
    background-color: white
  &::-webkit-scrollbar-track
    background-color: $grey


ol
  margin-left: 1.2rem
  position: relative

  &.un-ordered
    list-style-type: disc

  li
    margin-bottom: 1em
    &.gap
      margin-top: 3em
    &.inGame
      list-style-type: disc

    div
      display: inline-block

    .item-wrapper
      width: 100%
      position: relative
      display: flex
      flex-direction: column

      .name-icons
        display: flex
        justify-content: space-between

        .player-name.me
          font-weight: bold


        .icon
          margin-left: 1em

      .results
        margin-top: 0.2em
        // padding-left: 1.2rem
        display: flex
        justify-content: space-between







</style>
