<template>
  <div class="container">
    <div class="wrapper">
      <h2>We detected unsupported screen resolution.</h2>
      <h2>Please open this app on bigger screen.</h2>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SmallScreen',
};
</script>

<style lang="sass" scoped>
.container
  display: flex
  align-items: center
  justify-content: space-around
  text-align: center
  height: 100vh

h2
  margin: 1em 0

</style>
