/** 
@type
 {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    require.resolve('@vercel/style-guide/eslint/node'),
    require.resolve('@vercel/style-guide/eslint/typescript'),
    'prettier',
  ],
  env: {
    node: true,
    jest: true,
  },
  rules: {},
  overrides: [
    {
      rules: { '@typescript-eslint/no-extraneous-class': 'off' },
      files: './src/**/*.module.{j,t}s',
    },
    {
      rules: {
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
      files: './test/*.e2e-{spec,test}.{t,j}s',
    },
  ],
};
