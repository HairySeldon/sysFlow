export interface SourceConfig {
  version: string;
  projectName?: string;
  mappings: Record<string, string>; // nodeId -> relativeFilePath
}

export const DEFAULT_SOURCE_CONFIG: SourceConfig = {
  version: '1.0.0',
  projectName: 'SysFlow Project',
  mappings: {
    CLK_GEN: 'rtl/clk_gen.v',
    ADDER: 'rtl/adder_32.v',
    MULTIPLIER: 'rtl/multiplier.v',
    REG_R0: 'rtl/reg_r0.v'
  }
};

/**
 * Resolves nested directories and gets/creates a file handle from a relative path.
 */
export async function getFileHandleFromPath(
  rootDirHandle: FileSystemDirectoryHandle,
  relativePath: string,
  create = false
): Promise<FileSystemFileHandle> {
  const normalized = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  const segments = normalized.split('/').filter(Boolean);
  if (segments.length === 0) {
    throw new Error('Path cannot be empty');
  }

  let currentDir = rootDirHandle;
  for (let i = 0; i < segments.length - 1; i++) {
    currentDir = await currentDir.getDirectoryHandle(segments[i], { create });
  }

  const fileName = segments[segments.length - 1];
  return await currentDir.getFileHandle(fileName, { create });
}

export async function readTextFile(
  rootDirHandle: FileSystemDirectoryHandle,
  relativePath: string
): Promise<string> {
  const fileHandle = await getFileHandleFromPath(rootDirHandle, relativePath, false);
  const file = await fileHandle.getFile();
  return await file.text();
}

export async function writeTextFile(
  rootDirHandle: FileSystemDirectoryHandle,
  relativePath: string,
  content: string
): Promise<void> {
  const fileHandle = await getFileHandleFromPath(rootDirHandle, relativePath, true);
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}
