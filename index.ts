#!/usr/bin/env node

import { Command } from 'commander';
import { intro } from '@clack/prompts';
import { defaultBanner, gradientBanner } from './lib/banners.ts';
import { assertResultReady, toValidPackageName } from './lib/utils.ts';

import pc from 'picocolors';
import packageJson from './package.json' with { type: 'json' };
import { logoSixel, supportsSixel } from './lib/sixel.ts';
import { type PromptResult, prompts } from './lib/prompts.ts';
import { endSession } from './lib/end-session.ts';
import { collectFlags } from './lib/collect-flags.ts';
import path from 'node:path';

async function init() {
  const program = new Command();

  program
    .name(packageJson.name)
    .version(packageJson.version)
    .description(packageJson.description)
    .argument('[projectName]', 'name of the project')
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
  const [projectNameArg] = program.args;

  // Check if any CLI options were provided
  const hasTemplateFlag = !!options.template;
  const hasFeatureFlags =
    options.git || options.typescript || options.warpdrive || options.prettier;
  const hasLintingFlags = options.eslint || options.stylelint || options.templatelint;
  const hasTestingFlags = options.qunit || options.vitest;
  const hasAnyFlags = hasTemplateFlag || hasFeatureFlags || hasLintingFlags || hasTestingFlags;

  const defaultProjectName = projectNameArg || 'ember-project';
  const isInteractive = process.stdout.isTTY && process.stdin.isTTY;
  const hasColors = process.stdout.hasColors(8) ?? false;

  const result: PromptResult = {
    projectName: defaultProjectName,
    packageName: toValidPackageName(defaultProjectName),
    targetDir: path.resolve('./' + toValidPackageName(defaultProjectName)),
    features: [],
    linting: [],
    testing: null,
    template: 'app',
  };

  console.log(); // intentional blank line
  if (supportsSixel) {
    console.log('   ' + logoSixel);
  }

  intro(isInteractive && hasColors ? pc.bold(gradientBanner) : defaultBanner);

  if (hasAnyFlags) {
    await collectFlags(options, result, projectNameArg);
  } else {
    await prompts(result, projectNameArg);
  }

  assertResultReady(result);
  await endSession(result as Required<PromptResult>);

  console.log();
  console.log('We would then scaffold the project with the following configuration:');
  console.log(result);
}

init().catch((error) => {
  console.error(pc.red('An unexpected error occurred:'));
  console.error(error);
  process.exit(1);
});
