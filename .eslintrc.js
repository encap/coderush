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
    allowImportExportEverywhere: true,
  },
  ignorePatterns: [
    'public/', 'dist/', 'master/',
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-shadow': ['error', { allow: ['state'] }],
    'max-len': 'off',
    'vue/no-parsing-error': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'no-prototype-builtins': 'off',
    'consistent-return': 'off',
    'no-param-reassign': 'off',
    'no-multiple-empty-lines': 'off',
    'no-mixed-operators': [
      'warn',
      {
        allowSamePrecedence: true,
      },
    ],
    'vue/max-attributes-per-line': ['error', {
      singleline: 3,
      multiline: {
        max: 1,
        allowFirstLine: false,
      },
    }],
    'object-property-newline': ['warn', {
      allowMultiplePropertiesPerLine: true,
    }],
  },
};
