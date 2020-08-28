<template>
  <div class="choose-language">
    <input type="text" placeholder="Search">
    <div class="list-container">
      <transition>
      <div class="list-loading" v-if="!list">Loading</div>
      </transition>
      <div class="list">
        <label v-for="(language, index) in list" :key="language.name">
          <span class="name">{{ language.name }}</span>
          <input type="radio" name="language-radio" :value="index" @input="setLanguage"/>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters(['list']),
  },
  methods: {
    setLanguage(e) {
      this.$store.commit('SET_LANGUAGE', this.list[e.target.value]);
    },
  },
};
</script>