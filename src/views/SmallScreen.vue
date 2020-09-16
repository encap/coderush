<template>
  <div class="container">
    <div>
      <h2>We detected unsupported screen resolution.<br><br>Please open this app on bigger screen (1920x1080)</h2>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SmallScreen',
};
</script>

<style lang="sass"  scoped>
.container
  height: 100vh
  display: flex
  flex-direction: row
  justify-content: space-around
  align-items: center


div
  text-align: center

</style
