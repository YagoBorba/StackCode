// packages/cli/test/commands/config.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import inquirer from 'inquirer';
import { getConfigCommand, handleNonInteractiveMode, runInteractiveMode } from '../../src/commands/config';
import fs from 'fs/promises';
import path from 'path';

// --- Mocks ---
vi.mock('inquirer');

const mockSet = vi.fn();
const mockGet = vi.fn();
const mockDelete = vi.fn();
const mockClear = vi.fn();

vi.mock('configstore', () => ({
  default: vi.fn(() => ({
    set: (...args) => mockSet(...args),
    get: (...args) => mockGet(...args),
    delete: (...args) => mockDelete(...args),
    clear: (...args) => mockClear(...args),
  })),
}));

vi.mock('fs/promises');
vi.mock('@stackcode/i18n', () => ({ t: (key: string) => key }));


// --- Type Assertions for Mocks ---
const mockedInquirer = vi.mocked(inquirer);
const mockedFs = vi.mocked(fs);

describe('Config Command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Handler Orchestration', () => {
    const { handler } = getConfigCommand();

    it('should call runInteractiveMode when no action is provided', async () => {
        // FIX: Provide a resolved value for the prompt to prevent the TypeError.
        // An empty object is sufficient as we only want to test the call.
        mockedInquirer.prompt.mockResolvedValue({});

        await handler({ _: ['config'], $0: 'stc' });
        expect(mockedInquirer.prompt).toHaveBeenCalled();
    });

    it('should call handleNonInteractiveMode when an action is provided', async () => {
        const args = { _: ['config', 'set'], $0: 'stc', action: 'set', key: 'lang', value: 'en' };
        await handler(args);
        expect(mockedInquirer.prompt).not.toHaveBeenCalled();
        expect(mockSet).toHaveBeenCalledWith('lang', 'en');
    });
  });

  describe('Non-Interactive Mode', () => {
    it('should set a configuration value', async () => {
      const args = { action: 'set', key: 'lang', value: 'en', _: [], $0: 'stc' };
      await handleNonInteractiveMode(args);
      expect(mockSet).toHaveBeenCalledOnce();
      expect(mockSet).toHaveBeenCalledWith('lang', 'en');
      expect(console.log).toHaveBeenCalledWith('config.success.set');
    });

    it('should show an error if "set" is missing arguments', async () => {
      const args = { action: 'set', key: 'lang', _: [], $0: 'stc' };
      await handleNonInteractiveMode(args);
      expect(mockSet).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('config.error.missing_set_args');
    });
  });

  describe('Interactive Mode', () => {
    it('should set language preference when user selects that option', async () => {
      mockedInquirer.prompt
        .mockResolvedValueOnce({ choice: 'lang' })
        .mockResolvedValueOnce({ lang: 'pt' });
      
      await runInteractiveMode();

      expect(mockedInquirer.prompt).toHaveBeenCalledTimes(2);
      expect(mockSet).toHaveBeenCalledWith('lang', 'pt');
      expect(console.log).toHaveBeenCalledWith('config.success.set');
    });

    it('should enable commit validation when user confirms', async () => {
      vi.spyOn(path, 'join').mockReturnValue('/fake/project/.stackcoderc.json');
      vi.spyOn(process, 'cwd').mockReturnValue('/fake/project/src');
      mockedFs.access.mockResolvedValue(undefined);
      const fakeConfig = { features: { commitValidation: false } };
      mockedFs.readFile.mockResolvedValue(JSON.stringify(fakeConfig));
      
      mockedInquirer.prompt
        .mockResolvedValueOnce({ choice: 'commitValidation' })
        .mockResolvedValueOnce({ enable: true });

      await runInteractiveMode();

      expect(mockedFs.writeFile).toHaveBeenCalledOnce();
      const writtenContent = JSON.parse(vi.mocked(mockedFs.writeFile).mock.calls[0][1] as string);
      expect(writtenContent.features.commitValidation).toBe(true);
      expect(console.log).toHaveBeenCalledWith('config.success.set_validation');
    });
  });
});