import { BaseCommand } from './BaseCommand';
export declare class GitCommand extends BaseCommand {
    execute(): Promise<void>;
    startBranch(): Promise<void>;
    finishBranch(): Promise<void>;
}
