import * as vscode from 'vscode';
import { ProactiveNotificationManager } from '../notifications/ProactiveNotificationManager';
import { ConfigurationManager } from '../config/ConfigurationManager';
export declare class GitMonitor implements vscode.Disposable {
    private proactiveManager;
    private configManager;
    private disposables;
    private lastBranch;
    constructor(proactiveManager: ProactiveNotificationManager, configManager: ConfigurationManager);
    startMonitoring(): void;
    private setupGitMonitoring;
    private checkCurrentBranch;
    showCreateBranchDialog(): Promise<void>;
    showCommitMessageDialog(): Promise<void>;
    dispose(): void;
}
