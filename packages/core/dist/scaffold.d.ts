export interface ProjectOptions {
    projectPath: string;
    stack: 'node-ts';
    features: ('docker' | 'husky')[];
    replacements: Record<string, string>;
}
/**
 * Scaffolds a new project based on the provided options.
 * @param options - The project configuration options.
 */
export declare function scaffoldProject(options: ProjectOptions): void;
/**
 * Sets up Husky hooks in the newly created project directory.
 * @param projectPath - The absolute path to the project's root directory.
 */
export declare function setupHusky(projectPath: string): void;
