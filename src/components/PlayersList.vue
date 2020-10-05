<template>
  <div>
    <!-- <h3>{{ room.connected ? 'Connected' : 'Disconnected' }} -- Room {{ room.name }}</h3> -->
    <h4 class="players-count">
      {{ Object.keys(room.players).length === 1 ? '1 player' : Object.keys(room.players).length + ' players' }}
    </h4>
    <ol>
      <li
        v-for="player in sortedPlayers"
        :key="player.name"
        :class="{inGame: $route.path === '/results' && !player.place }"
      >
        <span
          :class="{ owner: player.owner,
                    me: player.name === room.myName,
                    winner: player.name === room.winner}"
        >{{ player.name }}</span>

        <span v-show="$route.path === '/' && !player.inLobby"> (in game)</span>
        <div class="icons">
          <fa
            v-show="player.ready && player.connected && !room.owner"
            class="icon"
            :icon="['fas', 'hourglass-end']"
            size="xs"
          />
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

        <span v-if="$route.path === '/results' && player.place"> {{ player.stats.minutes ? `${player.stats.minutes}:${player.stats.seconds}` : `${player.stats.seconds}s` }} {{ player.stats.wpm }} WPM</span>
      </li>
    </ol>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'PlayersList',
  computed: {
    ...mapGetters(['room', 'players']),
    playersArray() {
      return Object.entries(this.players).map(([name, data]) => ({ name, ...data }));
    },
    sortedPlayers() {
      console.log('players list update');
      if (this.$route.path === '/results') {
        // dont mutate original
        return [...this.playersArray].sort((p1, p2) => {
          if (p2.place) {
            return p1.place - p2.place;
          }
          return -1;
        });
      }
      return this.playersArray;
    },
  },
  methods: {
  },
};
</script>

<style lang="sass" scoped>
.players-count
  font-weight: normal
  margin: 1em 0

.me
  font-weight: bold

ol
  list-style-position: inside

.icon
  margin-left: .5em

.inGame
  list-style: none
  margin-left: 1.5em
</style>
