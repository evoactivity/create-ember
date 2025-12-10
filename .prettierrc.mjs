export default {
  arrowParens: 'always',
  trailingComma: 'all',
  bracketSpacing: true,
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'css',
  insertPragma: false,
  singleAttributePerLine: false,
  bracketSameLine: false,
  printWidth: 100,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  plugins: ['prettier-plugin-ember-template-tag'],
  overrides: [
    {
      files: ['*.gjs', '*.gts'],
      options: {
        templateSingleQuote: false,
        trailingComma: 'es5',
      },
    },
  ],
};
