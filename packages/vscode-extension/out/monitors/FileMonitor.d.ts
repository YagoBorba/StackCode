import * as vscode from 'vscode';
import { ProactiveNotificationManager } from '../notifications/ProactiveNotificationManager';
import { ConfigurationManager } from '../config/ConfigurationManager';
export declare class FileMonitor implements vscode.Disposable {
    private proactiveManager;
    private configManager;
    private disposables;
    private processedFiles;
    constructor(proactiveManager: ProactiveNotificationManager, configManager: ConfigurationManager);
    startMonitoring(): void;
    private handleFileCreation;
    private handleFileChange;
    private handleFileOpen;
    private checkProjectStructure;
    dispose(): void;
}
