<template>
  <div>
    <!-- <h3>{{ room.connected ? 'Connected' : 'Disconnected' }} -- Room {{ room.name }}</h3> -->
    <h4 class="players-count">
      {{ Object.keys(room.players).length === 1 ? '1 player' : Object.keys(room.players).length + ' players' }}
    </h4>
    <ol>
      <li v-for="player in sortedPlayers" :key="player.name">
        <span :class="{ owner: player.owner, me: player.name === room.myName && !room.owner, winner: player.name === room.winner }">{{ player.name }}{{ player.name === room.myName ? ' (You)' : '' }} {{ player.ready && player.connected ? '✔' : '' }} {{ player.connected ? '🌐' : '❎' }}</span>
        <span v-if="$route.path === '/results' && room.ready">{{ player.stats.wpm }} WPM {{ player.stats.mistaskesCount || 0 }} Errors</span>
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
      console.error('UPDATE PLAYERARRAY');
      console.warn(this.players);
      return Object.entries(this.players).map(([name, data]) => ({ name, ...data }));
    },
    sortedPlayers() {
      console.warn('update sortedPlayers');
      if (this.$route.path === '/results' && this.room.ready) {
        console.log('results path');
        return this.playersArray.filter((player) => {
          console.error(player); return player.stats;
        })
          .sort((p1, p2) => ((p1.time > p2.time) ? 1 : -1));
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
.owner
  color: greenyellow

.me
  color: pink

ol
  list-style: inside
  overflow: auto

</style>
