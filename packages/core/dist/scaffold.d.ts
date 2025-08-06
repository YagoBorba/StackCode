export interface ProjectOptions {
    projectPath: string;
    stack: "node-ts";
    features: ("docker" | "husky")[];
    replacements: Record<string, string>;
}
export declare function scaffoldProject(options: ProjectOptions): Promise<void>;
export declare function setupHusky(projectPath: string): Promise<void>;
