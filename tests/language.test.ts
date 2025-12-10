import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import getLanguage from '../lib/language.ts';

vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof fs>('node:fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    promises: {
      readFile: vi.fn(),
    },
  };
});

describe('language', () => {
  const mockLocalesRoot = '/mock/locales';
  const mockLanguageData = {
    welcomeMessage: { message: 'Welcome!' },
    projectName: { message: 'Project name' },
    shouldOverwrite: { message: 'Overwrite?' },
    packageName: { message: 'Package name' },
    needsTypeScript: { message: 'Use TypeScript?' },
    needsWarpDrive: { message: 'Use Warp Drive?' },
    needsTests: { message: 'Include tests?' },
    needsEslint: { message: 'Include ESLint?' },
    needsPrettier: { message: 'Include Prettier?' },
    needsStylelint: { message: 'Include Stylelint?' },
    needsTemplateLint: { message: 'Include Template Lint?' },
    needsGit: { message: 'Initialize Git?' },
    needsQunit: { message: 'Use QUnit?' },
    needsVitest: { message: 'Use Vitest?' },
    needsTailwind: { message: 'Use Tailwind?' },
    needsContinuousIntegration: { message: 'Setup CI?' },
    invalidPackageName: { message: 'Invalid package name' },
    linting: { message: 'Select linting tools' },
    testing: { message: 'Select testing framework' },
    creatingProject: { message: 'Creating project...' },
    projectCreated: { message: 'Project created!' },
    installingDependencies: { message: 'Installing dependencies...' },
    dependenciesInstalled: { message: 'Dependencies installed!' },
    nextSteps: { message: 'Next steps:' },
    featureSelection: { message: 'Select features' },
    templateSelection: { message: 'Select template' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock process.env
    delete process.env.LC_ALL;
    delete process.env.LC_MESSAGES;
    delete process.env.LANG;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getLanguage', () => {
    it('should load the default en-US locale when no locale is set', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.promises.readFile).mockResolvedValue(JSON.stringify(mockLanguageData));

      const result = await getLanguage(mockLocalesRoot);

      expect(fs.promises.readFile).toHaveBeenCalledWith(
        path.resolve(mockLocalesRoot, 'en-US.json'),
        'utf-8',
      );
      expect(result).toEqual(mockLanguageData);
    });

    it('should load locale from LC_ALL environment variable', async () => {
      process.env.LC_ALL = 'fr-FR.UTF-8';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.readFile).mockResolvedValue(JSON.stringify(mockLanguageData));

      await getLanguage(mockLocalesRoot);

      expect(fs.existsSync).toHaveBeenCalledWith(path.resolve(mockLocalesRoot, 'fr-FR.json'));
      expect(fs.promises.readFile).toHaveBeenCalledWith(
        path.resolve(mockLocalesRoot, 'fr-FR.json'),
        'utf-8',
      );
    });

    it('should load locale from LC_MESSAGES when LC_ALL is not set', async () => {
      process.env.LC_MESSAGES = 'de-DE.UTF-8';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.readFile).mockResolvedValue(JSON.stringify(mockLanguageData));

      await getLanguage(mockLocalesRoot);

      expect(fs.existsSync).toHaveBeenCalledWith(path.resolve(mockLocalesRoot, 'de-DE.json'));
    });

    it('should load locale from LANG when LC_ALL and LC_MESSAGES are not set', async () => {
      process.env.LANG = 'es-ES.UTF-8';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.readFile).mockResolvedValue(JSON.stringify(mockLanguageData));

      await getLanguage(mockLocalesRoot);

      expect(fs.existsSync).toHaveBeenCalledWith(path.resolve(mockLocalesRoot, 'es-ES.json'));
    });

    it('should fallback to en-US when locale file does not exist', async () => {
      process.env.LANG = 'ja-JP.UTF-8';
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.promises.readFile).mockResolvedValue(JSON.stringify(mockLanguageData));

      await getLanguage(mockLocalesRoot);

      expect(fs.promises.readFile).toHaveBeenCalledWith(
        path.resolve(mockLocalesRoot, 'en-US.json'),
        'utf-8',
      );
    });

    it('should handle C locale and map to en-US', async () => {
      process.env.LANG = 'C';
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.promises.readFile).mockResolvedValue(JSON.stringify(mockLanguageData));

      await getLanguage(mockLocalesRoot);

      expect(fs.promises.readFile).toHaveBeenCalledWith(
        path.resolve(mockLocalesRoot, 'en-US.json'),
        'utf-8',
      );
    });

    it('should convert underscore to dash in locale', async () => {
      process.env.LANG = 'en_US.UTF-8';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.readFile).mockResolvedValue(JSON.stringify(mockLanguageData));

      await getLanguage(mockLocalesRoot);

      expect(fs.existsSync).toHaveBeenCalledWith(path.resolve(mockLocalesRoot, 'en-US.json'));
    });

    it('should strip encoding suffix from locale', async () => {
      process.env.LANG = 'en-GB.UTF-8';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.readFile).mockResolvedValue(JSON.stringify(mockLanguageData));

      await getLanguage(mockLocalesRoot);

      expect(fs.existsSync).toHaveBeenCalledWith(path.resolve(mockLocalesRoot, 'en-GB.json'));
    });

    it('should map zh-TW to zh-Hant', async () => {
      process.env.LANG = 'zh_TW.UTF-8';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.readFile).mockResolvedValue(JSON.stringify(mockLanguageData));

      await getLanguage(mockLocalesRoot);

      expect(fs.existsSync).toHaveBeenCalledWith(path.resolve(mockLocalesRoot, 'zh-Hant.json'));
    });

    it('should map zh-CN to zh-Hans', async () => {
      process.env.LANG = 'zh_CN.UTF-8';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.readFile).mockResolvedValue(JSON.stringify(mockLanguageData));

      await getLanguage(mockLocalesRoot);

      expect(fs.existsSync).toHaveBeenCalledWith(path.resolve(mockLocalesRoot, 'zh-Hans.json'));
    });

    it('should parse JSON data correctly', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.promises.readFile).mockResolvedValue(JSON.stringify(mockLanguageData));

      const result = await getLanguage(mockLocalesRoot);

      expect(result).toEqual(mockLanguageData);
      expect(result.welcomeMessage.message).toBe('Welcome!');
      expect(result.projectName.message).toBe('Project name');
    });
  });
});
