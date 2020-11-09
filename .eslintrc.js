module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/airbnb',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  ignorePatterns: [
    'public/', 'dist/',
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-shadow': ['error', { allow: ['state'] }], // vuex exception
    'max-len': 'off',
    'consistent-return': 'off',
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
    'no-underscore-dangle': ['error', { allow: ['_vm'] }], // vuex exception
    'no-mixed-operators': ['warn', { allowSamePrecedence: true }],
    'vue/max-attributes-per-line': ['error', { singleline: 3, multiline: { max: 1, allowFirstLine: false } }],
    'object-property-newline': ['warn', { allowMultiplePropertiesPerLine: true }],
  },
};
