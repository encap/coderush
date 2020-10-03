<template>
  <div class="container">
    <main class="middle">
      <h1>Contribute</h1>

      <article>
        <p>
          Our mission is to ensure the diversity and quality of the code<span v-show="!expand || sent"> in which our users practice and test their skills.  do our best to ensure that there are no errors in the code but with that many languages and technologies available on CodeRush, it is not possible without your help.</span><span v-show="expand && !sent">...</span>
        </p>
        <p v-show="!expand || sent">
          On this page you can help expand our code database by sending us your code in a language of your choice. The "Send" button will create a PR and after verirfication your code will be publicly avaible on <a href="https://github.com/encap/coderush">our GitHub repo</a> .
          Please don't paste a code that you did not write yourself or that is under NDA or any other code that we will not be able to use for legal resons.
        </p>
        <p v-show="!expand|| sent">
          You can also file an issue and contribute directly on <a href="https://github.com/encap/coderush#readme">our GitHub</a>
        </p>
      </article>
      <div class="inputs">
        <div class="inputContainer">
          <label>Your name (or nick)</label>
          <div class="inputWrapper">
            <input
              ref="authorInput"
              v-model="author"
              type="text"
              placeholder="e.g Evan You"
              maxlength="40"
            >
            <span v-show="author" class="char-limit">{{ 30 - author.length }} / 30</span>
          </div>
        </div>
        <div class="inputContainer">
          <label>Code functionality (or product name)</label>
          <div class="inputWrapper">
            <input
              ref="nameInput"
              v-model="name"
              type="text"
              placeholder="e.g UrlHelperService"
              maxlength="25"
            >
            <span v-show="name" class="char-limit">{{ 25 - name.length }} / 40</span>
          </div>
        </div>
      </div>
      <UploadCode
        v-show="!sent"
        ref="code"
        class="editor-wrapper"
        @expand="(value) => expand = value"
      />
      <p v-show="sent">
        Thank you for your contribution. Your submission will soon be listed <a href="https://github.com/encap/coderush/pulls">here</a>.
      </p>

      <p v-show="error" class="error">
        {{ error }}
      </p>

      <div v-show="language.index" class="buttons-bottom">
        <button class="button" @click="clear">
          {{ sent ? 'Submit new code' : 'Clear' }}
        </button>
        <button class="button" @click="sendCustomCode">
          Send
        </button>
      </div>
    </main>

    <LanguagesList ref="languagesList" class="languages-list" />
  </div>
</template>

<script>
import UploadCode from '@/components/UploadCode.vue';
import LanguagesList from '@/components/LanguagesList.vue';

import axios from 'axios';
import { mapGetters } from 'vuex';



export default {
  name: 'Contribute',
  components: {
    UploadCode,
    LanguagesList,
  },
  data() {
    return {
      author: '',
      name: '',
      error: '',
      sent: false,
      expand: false,
    };
  },
  computed: {
    ...mapGetters(['language', 'customCode']),
  },
  watch: {
    name(current) {
      if (current.length > 2) {
        this.error = '';
        this.$nextTick(this.$refs.code.fixHeight);
      }
    },
  },
  methods: {
    sendCustomCode() {
      if (this.customCode.text.length > 4000) {
        console.log('Code is to long');
        this.error = 'Provided code is way too long to be used here. (max 4000 characters)';
        this.$nextTick(this.$refs.code.fixHeight);
      } else if (this.customCode.lines < 4 && this.customCode.text.length < 200) {
        console.log('Code is to short');
        this.error = 'Code has to have minium 4 lines and 200 characters';
        this.$nextTick(this.$refs.code.fixHeight);
      } else if (this.author.length < 2 || this.name.length < 2) {
        this.error = 'Please fill out all of the inputs';
        this.$refs.nameInput.focus();
        this.$nextTick(this.$refs.code.fixHeight);
      } else {
        this.error = '';
        const data = {
          code: this.customCode.text,
          languageIndex: this.language.index,
          name: this.name.replace(' ', '_'),
          author: this.author,
          tabSize: this.customCode.tabSize,
          lines: this.customCode.lines,
        };
        const url = `${window.location.origin}/upload`;
        axios.post(url, data)
          .then(() => {
            this.sent = true;
            this.$nextTick(this.$refs.code.fixHeight);
          })
          .catch((err) => {
            this.error = 'Server error';
            this.$nextTick(this.$refs.code.fixHeight);
            console.red('Code submission failed');
            console.log(err.response);
          });
      }
    },
    clear() {
      this.$refs.code.clear();
      this.sent = false;
      this.name = '';
      this.$nextTick(this.$refs.code.fixHeight);
    },
  },
};
</script>

<style lang="sass" scoped>
.container
  position: relative
  display: flex
  justify-content: flex-end
  height: calc(100vh - 2 * #{$gap})

.middle
  position: relative
  flex-basis: 0
  flex-grow: 2
  max-width: 50%
  margin-right: $gap * 2
  display: flex
  flex-direction: column
  justify-content: space-between

h1
  margin: $grid-gap 0 1em

a
  color: $light-pink
  text-decoration: underline

article p
  font-size: 16px
  line-height: 1.4
  margin-bottom: 1em

.inputContainer
  display: flex
  flex-wrap: wrap
  justify-content: space-between
  align-items: center
  min-height: 40px
  position: relative

  &:first-child
    margin-top: 1em
  &:last-child
    margin-bottom: 1em

  label
    white-space: nowrap
    margin-right: 1em

  .inputWrapper
    max-width: 50%
    display: flex
    justify-content: space-between
    flex-grow: 1
    padding: $grid-gap
    border-bottom: $grid-gap solid $grid-color

    &:focus-within
      border-image: linear-gradient(to right, $light-purple, $grid-color 90%) 1

    input
      flex-grow: 1

    input::placeholder, .char-limit
      color: $grey

    .char-limit
      margin-left: 1em
      white-space: nowrap

.editor-wrapper
  flex-grow: 1
  max-height: 85vh
  overflow: hidden
  position: relative
  display: flex
  flex-direction: column

.error
  margin-top: 1em

.buttons-bottom
  display: flex
  justify-content: space-between
  align-items: flex-end
  margin-top: 1em
  margin-bottom: $grid-gap

.button
  display: flex
  text-align: center
  justify-content: space-around
  align-items: center
  width: 150px
  height: 47px
  background-color: $grid-color
  cursor: pointer
  flex-grow: 1
  max-width: 250px
  transition: background-color .15s ease-out


  &:first-child
    margin-right: $gap

  &:hover
    background-color: $purple

  &:active
    background-color: $pink

.languages-list
  position: relative
  max-width: 40%
  flex-grow: 4
  flex-basis: 0
  display: flex
  flex-direction: column
</style>
