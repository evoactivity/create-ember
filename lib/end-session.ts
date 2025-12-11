import { log, note, outro } from '@clack/prompts';
import { language } from './language.ts';
import pc from 'picocolors';
import type { PromptResult } from './prompts.ts';

export async function endSession(result: Required<PromptResult>) {
  log.success(
    `✨🐹 ${language.projectCreated.message.replace(
      '{projectName}',
      pc.greenBright(pc.bold(result.projectName)),
    )}`,
  );

  let endMessage = `Now you can get started with your new Ember project:\n\n`;
  endMessage += `   1) cd ${pc.blueBright('' + (result.packageName.includes(' ') ? `"./${result.packageName}"` : `./${result.packageName}`))}\n`;
  endMessage += `   2) pnpm install\n`;
  endMessage += `   3) pnpm dev\n\n`;
  endMessage += `To close the dev server, hit ${pc.bold('Ctrl-C')}\n\n`;
  endMessage += `Need some help? Visit ${pc.underline('https://discord.gg/emberjs')}`;

  note(endMessage, 'What to do next:', { format: (line) => line });

  outro(`Go build something amazing!`);
}
