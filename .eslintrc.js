module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
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
