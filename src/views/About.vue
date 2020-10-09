<template>
  <div>
    <section class="container">
      <main>
        <h2>Welcome to CodeRush</h2>

        <p>
          Keyboard is an essential tool for the programmer. It turns out that the most commonly used key is a backspace. Very often, mistakes are coused by miss-click or a bad typing technique. That reduces our efficiency and causes programmer to loose focus on the actual coding problem.
        </p>
        <p>
          CodeRush allows you to test your writing skills in more than 30 most popular technologies and 3 diffrent game modes. In addition to calculating your CPM (characters per minute), it provides you with detailed statistics for example the most frequently miss-clicked keys, so that You will pay attention to them in the future.
        </p>
        <p>
          CodeRush allows you to create a multiplayer server, so that you can compete with invited friends and colleagues.
        </p>
        <p>
          We do our best to ensure the diversity and quality of the code on which you will test your skills. You can <a>donate here</a> or <a @click="$router.push('/contribute')">contribute</a> if you like it.
        </p>
      </main>
      <aside>
        <h2>Coderush statistics</h2>
      </aside>
    </section>

    <img :src="`${publicPath}results.webp`" alt="gallery">
  </div>
</template>

<script>

export default {
  name: 'About',
  components: {
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
    };
  },
};
</script>

<style lang="sass" scoped>
.container
  display: flex
  justify-content: space-between
  margin-bottom: $gap


main
  flex-grow: 1
  flex-shrink: 2
  max-width: 50%
  margin-right: $gap

  p
    font-size: 16px
    line-height: 1.4
    margin: 1em 0

  a
    color: lighten($washed-purple, 5%)
    text-decoration: underline

aside
  flex-grow: 1
img
  @include shadow(0.3, 20px)
  // margin: 20px
  width: 100%

</style>
