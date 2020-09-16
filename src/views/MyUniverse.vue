<template>
  <div class="wrapper">
    <h1>My part of universe</h1>
    <main>
      <p>Beside programming I'm jumping on my bike pretty big stuff and occasionally shredding some downhill tracks in bikepark.</p>
      <img src="10m.jpg">
      <p>
        This was taken 2 years ago, every jump after that one wouldn't fit in the frame.
        The problem is that I'm usually doing it alone (what a suprise) or when I'm with someone, there is just no time for setting up the camera. So you must take my word for it.
      </p>
      <p />
      <p>I'm currently rebuiliding whole layout. Everything after that works, but not for everyone. If something is overflowing or not visible, try zooming out to 80% in your browser.</p>
      <p />
    </main>
    <footer>
      <button @click="$router.push('run')">
        Close
      </button>
    </footer>
  </div>
</template>

<script>

export default {
  name: 'MyUniverse',
};
</script>

<style lang="sass" scoped>
.wrapper
  margin: 0 2em 0 1em
  display: flex
  flex-direction: column
  justify-content: space-between
  height: 100%

p
  margin: 1em 0
  width: 70%
  font-size: 1.1em

img
  width: 100%
  height: auto
  @include shadow()

footer
  display: flex
  align-self: flex-end
  justify-content: flex-end

button
  text-decoration: none
  text-align: center
  height: 47px
  cursor: pointer
  margin-right: 0
  width: 200px
  background: linear-gradient(to right, $purple, $light-purple 50%, $grid-color 50% 100%)
  background-size: 200%
  background-position: right
  transition: background .2s ease-in

  &:hover
    transition: background .4s ease-in-out
    background-position: left
</style>
