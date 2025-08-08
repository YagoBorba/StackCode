import { ConfigurationManager } from '../config/ConfigurationManager';
export interface NotificationAction {
    title: string;
    action: () => Promise<void>;
}
export declare class ProactiveNotificationManager {
    private configManager;
    private readonly notificationQueue;
    constructor(configManager: ConfigurationManager);
    showWelcomeMessage(): Promise<void>;
    showBranchWarning(currentBranch: string): Promise<void>;
    showCommitMessageWarning(message: string): Promise<void>;
    showFileCreationSuggestion(fileName: string): Promise<void>;
    runFullBestPracticesCheck(): Promise<void>;
    private isConventionalCommit;
    dispose(): void;
}
