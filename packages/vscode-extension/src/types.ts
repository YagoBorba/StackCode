export interface BranchType {
    label: string;
    description: string;
}

export interface CommitType {
    label: string;
    description: string;
}

export interface NotificationSettings {
    enabled: boolean;
    branchCheck: boolean;
    commitCheck: boolean;
}

export interface ProjectFile {
    name: string;
    required: boolean;
    template?: string;
}

export interface BestPracticesIssue {
    type: 'warning' | 'error' | 'info';
    message: string;
    action?: () => Promise<void>;
}
