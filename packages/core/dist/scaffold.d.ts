export interface ProjectOptions {
    projectPath: string;
    stack: "node-js" | "node-ts" | "react" | "vue" | "python" | "java" | "go" | "php";
    features: ("docker" | "husky")[];
    replacements: Record<string, string>;
}
export declare function scaffoldProject(options: ProjectOptions): Promise<void>;
export declare function setupHusky(projectPath: string): Promise<void>;
