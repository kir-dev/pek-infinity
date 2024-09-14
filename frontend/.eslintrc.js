/** 
@type
 {import('eslint').Linter.Config}
 */
module.exports = {
  plugins: ['react'],
  extends: ['next/core-web-vitals', 'plugin:react/recommended', '../.eslintrc.js'],
  ignorePatterns: ['node_modules/**/*', '.next/**/*', 'out/**/*', 'pek-api/**/*'],
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@next/next/no-html-link-for-pages': [2, `${__dirname}/pages`],
    'react/react-in-jsx-scope': 'off',
    'react/hook-use-state': 'error',
    'react/jsx-boolean-value': 'error',
    'react/jsx-curly-brace-presence': 'error',
    'react/jsx-no-useless-fragment': 'error',
    'react/jsx-pascal-case': 'error',
    'react/no-access-state-in-setstate': 'error',
    'react/no-array-index-key': 'error',
    'react/no-children-prop': 'error',
    'react/no-danger': 'error',
    'react/no-invalid-html-attribute': 'error',
    'react/no-object-type-as-default-prop': 'error',
    'react/no-this-in-sfc': 'error',
    'react/no-unstable-nested-components': 'error',
    'react/prefer-stateless-function': 'error',
    'react/self-closing-comp': 'error',
    'react/style-prop-object': 'error',
    'react/void-dom-elements-no-children': 'error',
  },
};
