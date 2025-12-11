import { language } from './language.ts';

export const FEATURE_OPTIONS = [
  {
    value: 'typescript',
    label: language.needsTypeScript.message,
    hint: language.needsTypeScript.hint,
  },
  {
    value: 'git',
    label: language.needsGit.message,
    hint: language.needsGit.hint,
  },
  {
    value: 'warpdrive',
    label: language.needsWarpDrive.message,
    hint: language.needsWarpDrive.hint,
  },
  {
    value: 'tailwind',
    label: language.needsTailwind.message,
    hint: language.needsTailwind.hint,
  },
  {
    value: 'prettier',
    label: language.needsPrettier.message,
    hint: language.needsPrettier.hint,
  },
  {
    value: 'ci',
    label: language.needsContinuousIntegration.message,
    hint: language.needsContinuousIntegration.hint,
  },
] as const;

export const LINTING_OPTIONS = [
  {
    value: 'eslint',
    label: language.needsEslint.message,
    hint: language.needsEslint.hint,
  },
  {
    value: 'stylelint',
    label: language.needsStylelint.message,
    hint: language.needsStylelint.hint,
  },
  {
    value: 'templatelint',
    label: language.needsTemplateLint.message,
    hint: language.needsTemplateLint.hint,
  },
] as const;

export const TESTING_OPTIONS = [
  {
    value: 'qunit',
    label: language.needsQunit.message,
    hint: language.needsQunit.hint,
  },
  {
    value: 'vitest',
    label: language.needsVitest.message,
    hint: language.needsVitest.hint,
  },
] as const;
