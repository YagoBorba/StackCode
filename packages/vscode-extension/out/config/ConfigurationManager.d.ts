export declare class ConfigurationManager {
    private configuration;
    constructor();
    get notificationsEnabled(): boolean;
    get branchCheckEnabled(): boolean;
    get commitCheckEnabled(): boolean;
    get autoGenerateReadme(): boolean;
    get autoGenerateGitignore(): boolean;
    get defaultBranchType(): string;
    get dashboardAutoOpen(): boolean;
    updateConfiguration(key: string, value: unknown): Promise<void>;
}
