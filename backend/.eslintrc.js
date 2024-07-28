/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['../.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
};
