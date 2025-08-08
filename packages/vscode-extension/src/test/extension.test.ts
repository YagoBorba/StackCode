import * as assert from 'assert';
import * as vscode from 'vscode';
import { ProactiveNotificationManager } from '../notifications/ProactiveNotificationManager';
import { ConfigurationManager } from '../config/ConfigurationManager';

suite('ProactiveNotificationManager Test Suite', () => {
    let notificationManager: ProactiveNotificationManager;
    let configManager: ConfigurationManager;

    setup(() => {
        configManager = new ConfigurationManager();
        notificationManager = new ProactiveNotificationManager(configManager);
    });

    test('Should detect conventional commit messages correctly', () => {
        // Access private method through any for testing
        const manager = notificationManager as any;
        
        assert.strictEqual(manager.isConventionalCommit('feat: add new feature'), true);
        assert.strictEqual(manager.isConventionalCommit('fix(auth): resolve login issue'), true);
        assert.strictEqual(manager.isConventionalCommit('docs: update readme'), true);
        assert.strictEqual(manager.isConventionalCommit('random commit message'), false);
        assert.strictEqual(manager.isConventionalCommit('WIP: work in progress'), false);
    });

    test('Should handle configuration correctly', () => {
        assert.strictEqual(typeof configManager.notificationsEnabled, 'boolean');
        assert.strictEqual(typeof configManager.branchCheckEnabled, 'boolean');
        assert.strictEqual(typeof configManager.commitCheckEnabled, 'boolean');
    });
});

suite('Extension Integration Test Suite', () => {
    test('Extension should activate successfully', async () => {
        const extension = vscode.extensions.getExtension('YagoBorba.stackcode-vscode');
        
        if (extension) {
            await extension.activate();
            assert.strictEqual(extension.isActive, true);
        }
    });

    test('Commands should be registered', async () => {
        const commands = await vscode.commands.getCommands();
        
        assert.ok(commands.includes('stackcode.createBranch'));
        assert.ok(commands.includes('stackcode.formatCommitMessage'));
        assert.ok(commands.includes('stackcode.checkBestPractices'));
    });
});
