/** 
@type
 {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  extends: [
    require.resolve('@vercel/style-guide/eslint/browser'),
    require.resolve('@vercel/style-guide/eslint/node'),
    require.resolve('@vercel/style-guide/eslint/react'),
    require.resolve('@vercel/style-guide/eslint/next'),
    require.resolve('@vercel/style-guide/eslint/typescript'),
    'next/core-web-vitals',
    'prettier',
  ],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // If running eslint from project root, this rule would search for pages in the root directory
    // https://github.com/vercel/next.js/discussions/24254#discussioncomment-947024
    '@next/next/no-html-link-for-pages': [2, `${__dirname}/pages`],
  },
  overrides: [
    {
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
      files: ['./**/*.{j,t}sx'],
    },
    {
      rules: {
        'import/no-default-export': 'off',
      },
      files: ['./app/**/{page,layout}.{j,t}sx', './pages/api/**/*.ts'],
    },
  ],
};
