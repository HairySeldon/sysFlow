export interface SourceConfig {
    version: string;
    projectName?: string;
    mappings: Record<string, string>;
}
export declare const DEFAULT_SOURCE_CONFIG: SourceConfig;
/**
 * Resolves nested directories and gets/creates a file handle from a relative path.
 */
export declare function getFileHandleFromPath(rootDirHandle: FileSystemDirectoryHandle, relativePath: string, create?: boolean): Promise<FileSystemFileHandle>;
export declare function readTextFile(rootDirHandle: FileSystemDirectoryHandle, relativePath: string): Promise<string>;
export declare function writeTextFile(rootDirHandle: FileSystemDirectoryHandle, relativePath: string, content: string): Promise<void>;
//# sourceMappingURL=fileSystem.d.ts.map