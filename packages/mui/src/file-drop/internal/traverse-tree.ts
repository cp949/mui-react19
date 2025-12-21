import type { DebugLevel } from '../types.js';
import type { PathHolder } from './path-util.js';
import type { PathAndEntry } from './visit-file-system/internal-types.js';
import { visitByFileSystemEntry } from './visit-file-system/visit-file-system-entry.js';
import { visitByFileSystemHandle } from './visit-file-system/visit-file-system-handle.js';

const hasProps = (target: object, ...keys: string[]): boolean => {
  return keys.every((it) => it in target);
};

export async function traverseTree(
  parent: PathHolder,
  handle: FileSystemHandle | FileSystemEntry | File,
  output: PathAndEntry[],
  callbackAccept: (file: File) => boolean,
  debugLevel: DebugLevel = 'none',
  parallel = true,
  concurrency = 4,
) {
  if (hasProps(handle, 'filesystem', 'fullPath', 'isDirectory', 'isFile')) {
    await visitByFileSystemEntry(
      parent,
      handle as FileSystemEntry,
      output,
      callbackAccept,
      debugLevel,
      parallel,
      concurrency,
    );
    return;
  }

  if (hasProps(handle, 'kind', 'isSameEntry')) {
    await visitByFileSystemHandle(
      parent,
      handle as FileSystemHandle,
      output,
      callbackAccept,
      debugLevel,
      parallel,
      concurrency,
    );
    return;
  }

  // file은 디렉토리인지 알 수 없음
  const file = handle as File;
  if (callbackAccept(file)) {
    output.push({
      type: 'file',
      file,
      path: parent.join(file.name),
    });
  }
}
