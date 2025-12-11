import { confirm, log, multiselect, select, text } from '@clack/prompts';
import { language } from './language.ts';
import { isValidPackageName, toValidPackageName, unwrapPrompt } from './utils.ts';
import pc from 'picocolors';
import { FEATURE_OPTIONS, LINTING_OPTIONS, TESTING_OPTIONS } from './features.ts';

export type PromptResult = {
  projectName: string;
  packageName: string;
  targetDir: string;
  features: Array<(typeof FEATURE_OPTIONS)[number]['value']>;
  linting: Array<(typeof LINTING_OPTIONS)[number]['value']>;
  testing: (typeof TESTING_OPTIONS)[number]['value'] | null;
  template: 'app' | 'addon';
};

export async function prompts(result: PromptResult, projectNameArg?: string) {
  log.message(language.welcomeMessage.message);

  if (!projectNameArg) {
    result.projectName = await unwrapPrompt(
      text({
        message: language.projectName.message,
        placeholder: result.projectName,
        defaultValue: result.projectName,
        validate: (value) =>
          !value || value.length === 0 || value.trim().length > 0
            ? undefined
            : language.projectName.invalidMessage,
      }),
    );

    result.targetDir = toValidPackageName(result.projectName);
  }

  if (!isValidPackageName(projectNameArg)) {
    result.packageName = await unwrapPrompt(
      text({
        message: language.packageName.message,
        initialValue: toValidPackageName(result.projectName),
        validate: (value) =>
          value && isValidPackageName(value) ? undefined : language.packageName.invalidMessage,
      }),
    );
  }

  // Template selection
  result.template = await unwrapPrompt(
    select({
      message: `${language.templateSelection.message} ${pc.dim(language.templateSelection.hint)}`,
      options: [
        {
          value: 'app',
          label: language.templateSelection.selectOptions?.app.title,
          hint: language.templateSelection.selectOptions?.app.desc,
        },
        {
          value: 'addon',
          label: language.templateSelection.selectOptions?.addon.title,
          hint: language.templateSelection.selectOptions?.addon.desc,
        },
      ],
    }),
  );

  if (result.template === 'addon') {
    const shouldUseTypescript = await unwrapPrompt(
      confirm({
        message: 'Should we set up TypeScript for you?',
        initialValue: true,
      }),
    );

    if (shouldUseTypescript) {
      result.features.push('typescript');
    }
  }

  if (result.template === 'app') {
    const projectType = await select({
      message: 'Pick a project type:',
      options: [
        {
          value: 'recommended',
          label: 'Recommended',
          hint: 'Git, CI, ESLint, Stylelint, Template lint, QUnit, Prettier',
        },
        { value: 'minimal', label: 'Minimal', hint: 'No additional features' },
        { value: 'custom', label: 'Custom', hint: 'Choose your own features' },
      ],
    });

    if (projectType === 'recommended') {
      result.features = ['git', 'prettier', 'ci'];
      result.linting = ['eslint', 'stylelint', 'templatelint'];
      result.testing = 'qunit';
    }

    if (projectType !== 'custom') {
      const shouldUseTypescript = await unwrapPrompt(
        confirm({
          message: 'Should we set up TypeScript for you?',
          initialValue: true,
        }),
      );

      if (shouldUseTypescript) {
        result.features.push('typescript');
      }
    }

    if (projectType === 'custom') {
      // Features selection
      result.features = await unwrapPrompt(
        multiselect({
          message: `${language.featureSelection.message} ${pc.dim(language.featureSelection.hint)}`,
          // @ts-expect-error @clack/prompt's type doesn't support readonly array yet
          options: FEATURE_OPTIONS,
          required: false,
        }),
      );

      // Linting selection
      result.linting = await unwrapPrompt(
        multiselect({
          message: `${language.linting.message} ${pc.dim(language.linting.hint)}`,
          // @ts-expect-error @clack/prompt's type doesn't support readonly array yet
          options: LINTING_OPTIONS,
          required: false,
        }),
      );

      // Testing selection
      result.testing = await unwrapPrompt(
        select({
          message: `${language.testing.message} ${pc.dim(language.testing.hint)}`,
          // @ts-expect-error @clack/prompt's type doesn't support readonly array yet
          options: TESTING_OPTIONS,
          required: false,
        }),
      );
    }
  }
}
