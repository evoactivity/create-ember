import type { OptionValues } from 'commander';
import { isValidPackageName, toValidPackageName } from './utils.ts';
import pc from 'picocolors';
import type { PromptResult } from './prompts.ts';
import { log } from '@clack/prompts';

export async function collectFlags(
  options: OptionValues,
  result: PromptResult,
  projectNameArg?: string,
) {
  if (!projectNameArg) {
    log.error(`No target directory specified.`);
    log.message(
      `Please provide a target directory as the first argument. eg ${pc.bold('pnpm create ember my-app')}
For more information, run ${pc.bold('pnpm create ember --help')}`,
    );
    process.exit(1);
  }
  if (!options.template) {
    log.message(`Defaulting to an Application template`);
    options.template = 'app';
  }

  const validTemplateSelection = options.template === 'app' || options.template === 'addon';
  if (!validTemplateSelection) {
    log.error(`Invalid template type specified.`);
    log.message(
      `Please provide a valid template type using --template option. Must be 'app' or 'addon'.`,
    );
    process.exit(1);
  }

  result.projectName = projectNameArg;
  result.packageName = isValidPackageName(projectNameArg)
    ? projectNameArg
    : toValidPackageName(projectNameArg);

  result.template = options.template;

  // Features selection
  if (options.git) result.features.push('git');
  if (options.typescript) result.features.push('typescript');
  if (options.warpdrive) result.features.push('warpdrive');
  if (options.prettier) result.features.push('prettier');

  // Linting selection
  if (options.eslint) result.linting.push('eslint');
  if (options.stylelint) result.linting.push('stylelint');
  if (options.templatelint) result.linting.push('templatelint');

  // Testing selection
  if (options.qunit) result.testing = 'qunit';
  if (options.vitest) result.testing = 'vitest';
}
