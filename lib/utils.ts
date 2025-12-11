import { cancel, isCancel } from '@clack/prompts';
import pc from 'picocolors';
import type { PromptResult } from './prompts.ts';
import assert from 'node:assert';

export function isValidPackageName(projectName?: string) {
  if (!projectName) {
    return false;
  }
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(projectName);
}

export function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z0-9-~]+/g, '-');
}

export async function unwrapPrompt<T>(maybeCancelPromise: Promise<T | symbol>): Promise<T> {
  const result = await maybeCancelPromise;

  if (isCancel(result)) {
    cancel(pc.red('✖') + ` Operation cancelled.`);
    process.exit(0);
  }
  return result;
}

export function assertResultReady(result: PromptResult) {
  assert(result.projectName, 'Project name should be defined');
  assert(result.packageName, 'Package name should be defined');
  assert(result.features, 'Features should be defined');
  assert(result.linting, 'Linting should be defined');
  assert(result.template, 'Template should be defined');
}
