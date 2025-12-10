import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isValidPackageName, toValidPackageName, unwrapPrompt } from '../lib/utils.ts';
import { isCancel, cancel } from '@clack/prompts';

vi.mock('@clack/prompts', () => ({
  isCancel: vi.fn(),
  cancel: vi.fn(),
}));

describe('utils', () => {
  describe('isValidPackageName', () => {
    it('should return true for valid package names', () => {
      expect(isValidPackageName('my-package')).toBe(true);
      expect(isValidPackageName('my-package-name')).toBe(true);
      expect(isValidPackageName('package123')).toBe(true);
      expect(isValidPackageName('@scope/package-name')).toBe(true);
      expect(isValidPackageName('@my-scope/my-package')).toBe(true);
      expect(isValidPackageName('a')).toBe(true);
      expect(isValidPackageName('package_name')).toBe(true);
      expect(isValidPackageName('package.name')).toBe(true);
      expect(isValidPackageName('package~name')).toBe(true);
    });

    it('should return false for invalid package names', () => {
      expect(isValidPackageName('')).toBe(false);
      expect(isValidPackageName('My-Package')).toBe(false);
      expect(isValidPackageName('my package')).toBe(false);
      expect(isValidPackageName('my@package')).toBe(false);
      expect(isValidPackageName('my!package')).toBe(false);
      expect(isValidPackageName('_package')).toBe(false);
      expect(isValidPackageName('.package')).toBe(false);
      expect(isValidPackageName('@/package')).toBe(false);
      expect(isValidPackageName('@scope/')).toBe(false);
      expect(isValidPackageName('package name with spaces')).toBe(false);
    });
  });

  describe('toValidPackageName', () => {
    it('should convert invalid names to valid package names', () => {
      expect(toValidPackageName('My Package')).toBe('my-package');
      expect(toValidPackageName('  Package Name  ')).toBe('package-name');
      expect(toValidPackageName('Package_Name')).toBe('package-name');
      expect(toValidPackageName('_package')).toBe('package');
      expect(toValidPackageName('.package')).toBe('package');
      expect(toValidPackageName('Package@Name')).toBe('package-name');
      expect(toValidPackageName('Package!Name#123')).toBe('package-name-123');
      expect(toValidPackageName('UPPERCASE')).toBe('uppercase');
    });

    it('should handle multiple spaces', () => {
      expect(toValidPackageName('my    package    name')).toBe('my-package-name');
    });

    it('should remove leading dots and underscores', () => {
      expect(toValidPackageName('._package')).toBe('-package');
      expect(toValidPackageName('..package')).toBe('-package');
      expect(toValidPackageName('__package')).toBe('-package');
    });

    it('should preserve valid characters', () => {
      expect(toValidPackageName('my-package-123')).toBe('my-package-123');
      expect(toValidPackageName('package_name')).toBe('package-name');
      expect(toValidPackageName('package.name')).toBe('package-name');
      expect(toValidPackageName('package~name')).toBe('package~name');
    });

    it('should handle empty strings', () => {
      expect(toValidPackageName('')).toBe('');
      expect(toValidPackageName('   ')).toBe('');
    });
  });

  describe('unwrapPrompt', () => {
    let mockExit: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      vi.mocked(isCancel).mockClear();
      vi.mocked(cancel).mockClear();
    });

    afterEach(() => {
      mockExit.mockRestore();
    });

    it('should return the result if not cancelled', async () => {
      vi.mocked(isCancel).mockReturnValue(false);
      const result = await unwrapPrompt(Promise.resolve('test-value'));
      expect(result).toBe('test-value');
      expect(isCancel).toHaveBeenCalled();
      expect(cancel).not.toHaveBeenCalled();
    });

    it('should return object results if not cancelled', async () => {
      vi.mocked(isCancel).mockReturnValue(false);
      const obj = { name: 'test', value: 123 };
      const result = await unwrapPrompt(Promise.resolve(obj));
      expect(result).toEqual(obj);
    });

    it('should call cancel and exit if result is cancelled', async () => {
      const cancelSymbol = Symbol('cancel');
      vi.mocked(isCancel).mockReturnValue(true);

      await expect(async () => {
        await unwrapPrompt(Promise.resolve(cancelSymbol));
      }).rejects.toThrow('process.exit called');

      expect(isCancel).toHaveBeenCalledWith(cancelSymbol);
      expect(cancel).toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('should handle promise rejection', async () => {
      vi.mocked(isCancel).mockReturnValue(false);
      const error = new Error('Promise rejected');
      await expect(unwrapPrompt(Promise.reject(error))).rejects.toThrow('Promise rejected');
    });
  });
});
