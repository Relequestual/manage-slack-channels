module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'prettier', 'plugin:import/errors', 'plugin:import/warnings'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        groups: ['builtin', 'external', ['index', 'parent', 'sibling'], 'internal', 'object'],
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.test.js', 'test/**'],
      plugins: ['jest'],
      env: {
        node: true,
        'jest/globals': true,
      },
      extends: ['plugin:jest/recommended'],
    },
  ],
};
