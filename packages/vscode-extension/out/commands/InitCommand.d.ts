import { BaseCommand } from './BaseCommand';
export declare class InitCommand extends BaseCommand {
    execute(): Promise<void>;
    private getGitUserName;
}
