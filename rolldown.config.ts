import { defineConfig } from 'rolldown';
import packageJson from './package.json' with { type: 'json' };

export default defineConfig({
  input: 'index.ts',
  output: {
    format: 'esm',
    file: 'bundle.js',
    banner: `/*! ${packageJson.name} v${packageJson.version} | MIT */`,
  },
  platform: 'node',
});
