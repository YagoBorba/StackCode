import { BaseCommand } from './BaseCommand';
export declare class GenerateCommand extends BaseCommand {
    execute(): Promise<void>;
    generateReadme(): Promise<void>;
    generateGitignore(): Promise<void>;
}
