#!/usr/bin/env node

import { Command } from 'commander';
import { intro, log, multiselect, note, outro, select, text } from '@clack/prompts';
import { defaultBanner, gradientBanner } from './lib/banners.ts';
import { isValidPackageName, toValidPackageName, unwrapPrompt } from './lib/utils.ts';
import getLanguage from './lib/language.ts';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import path from 'node:path';
import packageJson from './package.json' with { type: 'json' };
import { logoSixel, supportsSixel } from './lib/sixel.ts';

async function init() {
  console.log(); // intentional blank line
  if (supportsSixel) {
    console.log('   ' + logoSixel);
  }
  const language = await getLanguage(fileURLToPath(new URL('./locales', import.meta.url)));

  // Setup Commander
  const program = new Command();

  program
    .name(packageJson.name)
    .version(packageJson.version)
    .description(packageJson.description)
    .argument('[targetDir]', 'target directory for the project')
    .option('--template <type>', 'project template type: app or addon')
    .option('--git', 'initialize a Git repository')
    .option('--typescript', 'enable TypeScript support')
    .option('--warpdrive', 'include Warp Drive (data library)')
    .option('--eslint', 'include ESLint')
    .option('--prettier', 'include Prettier')
    .option('--stylelint', 'include Stylelint')
    .option('--templatelint', 'include Ember Template Lint')
    .option('--qunit', 'setup browser-based QUnit testing')
    .option('--vitest', 'setup Vitest for unit testing')
    .parse(process.argv);

  const options = program.opts();
  const [targetDirArg] = program.args;

  const cwd = process.cwd();
  const isInteractive = process.stdout.isTTY && process.stdin.isTTY;
  const hasColors = process.stdout.hasColors(8) ?? false;

  // Check if any CLI options were provided
  const hasTemplateFlag = !!options.template;
  const hasFeatureFlags = options.git || options.typescript || options.warpdrive;
  const hasLintingFlags =
    options.eslint || options.prettier || options.stylelint || options.templatelint;
  const hasTestingFlags = options.qunit || options.vitest;
  const hasAnyFlags = hasTemplateFlag || hasFeatureFlags || hasLintingFlags || hasTestingFlags;

  let targetDir = targetDirArg;
  const defaultProjectName = targetDir || 'ember-project';

  type PromptResult = {
    projectName?: string;
    packageName?: string;
    features: Array<(typeof FEATURE_OPTIONS)[number]['value']>;
    linting: Array<(typeof LINTING_OPTIONS)[number]['value']>;
    testing: (typeof TESTING_OPTIONS)[number]['value'] | null;
    template: 'app' | 'addon';
  };

  const result: PromptResult = {
    projectName: defaultProjectName,
    packageName: defaultProjectName,
    features: [],
    linting: [],
    testing: null,
    template: 'app',
  };

  const FEATURE_OPTIONS = [
    {
      value: 'git',
      label: language.needsGit.message,
      hint: language.needsGit.hint,
    },
    {
      value: 'typescript',
      label: language.needsTypeScript.message,
      hint: language.needsTypeScript.hint,
    },
    {
      value: 'warpdrive',
      label: language.needsWarpDrive.message,
      hint: language.needsWarpDrive.hint,
    },
    {
      value: 'prettier',
      label: language.needsPrettier.message,
      hint: language.needsPrettier.hint,
    },
    {
      value: 'tailwind',
      label: language.needsTailwind.message,
      hint: language.needsTailwind.hint,
    },
    {
      value: 'ci',
      label: language.needsContinuousIntegration.message,
      hint: language.needsContinuousIntegration.hint,
    },
  ] as const;

  const LINTING_OPTIONS = [
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

  const TESTING_OPTIONS = [
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

  intro(isInteractive && hasColors ? pc.bold(gradientBanner) : defaultBanner);

  // If using CLI flags, skip all prompts and use non-interactive mode
  if (hasAnyFlags) {
    // error if no target dir
    if (!targetDir) {
      log.error(`No target directory specified.`);
      log.message(
        `Please provide a target directory as the first argument. eg ${pc.bold('pnpm create ember my-app')}
For more information, run ${pc.bold('pnpm create ember --help')}`,
      );
      process.exit(1);
    } else {
      result.projectName = targetDir;
      result.packageName = isValidPackageName(targetDir)
        ? targetDir
        : toValidPackageName(targetDir);
    }

    // Template selection
    if (hasTemplateFlag) {
      if (options.template === 'app' || options.template === 'addon') {
        result.template = options.template;
      } else {
        log.error(`Invalid template type: ${options.template}. Must be 'app' or 'addon'.`);
        process.exit(1);
      }
    }

    // Features selection
    if (hasFeatureFlags) {
      if (options.git) result.features.push('git');
      if (options.typescript) result.features.push('typescript');
      if (options.warpdrive) result.features.push('warpdrive');
      if (options.prettier) result.features.push('prettier');
    }

    // Linting selection
    if (hasLintingFlags) {
      if (options.eslint) result.linting.push('eslint');
      if (options.stylelint) result.linting.push('stylelint');
      if (options.templatelint) result.linting.push('templatelint');
    }

    // Testing selection
    if (hasTestingFlags) {
      if (options.qunit) {
        result.testing = 'qunit';
      } else if (options.vitest) {
        result.testing = 'vitest';
      }
    }
  } else {
    // Interactive mode - show all prompts
    log.message(language.welcomeMessage.message);
    if (!targetDir) {
      const _result = await unwrapPrompt(
        text({
          message: language.projectName.message,
          placeholder: defaultProjectName,
          defaultValue: defaultProjectName,
          validate: (value) =>
            !value || value.length === 0 || value.trim().length > 0
              ? undefined
              : language.projectName.invalidMessage,
        }),
      );
      targetDir = result.projectName = result.packageName = _result.trim();
    }

    if (!isValidPackageName(targetDir)) {
      result.packageName = await unwrapPrompt(
        text({
          message: language.packageName.message,
          initialValue: toValidPackageName(targetDir),
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

  log.success(
    `✨🐹 ${language.projectCreated.message.replace(
      '{projectName}',
      pc.greenBright(pc.bold(result.projectName)),
    )}`,
  );

  let endMessage = `Now you can get started with your new Ember project:\n\n`;
  endMessage += `   1) cd ${pc.blueBright(path.resolve(cwd, targetDir).replace(cwd, '').slice(1))}\n`;
  endMessage += `   2) pnpm install\n`;
  endMessage += `   3) pnpm dev\n\n`;
  endMessage += `To close the dev server, hit ${pc.bold('Ctrl-C')}\n\n`;
  endMessage += `Need some help? Visit ${pc.underline('https://discord.gg/emberjs')}`;

  note(endMessage, 'What to do next:', { format: (line) => line });

  outro(`Go build something amazing!`);
}

init().catch((error) => {
  console.error(pc.red('An unexpected error occurred:'));
  console.error(error);
  process.exit(1);
});
