import type { DebugLevel } from '../../types.js';
import type { PathHolder } from '../path-util.js';
import { errmsg } from '../util.js';
import type { PathAndEntry } from './internal-types.js';

/**
 * visitByFileSystemEntry
 */
export async function visitByFileSystemEntry(
  parent: PathHolder,
  item: FileSystemEntry,
  output: PathAndEntry[],
  callbackAccept: (file: File) => boolean,
  debugLevel: DebugLevel = 'none',
  parallel = true,
  concurrency = 4,
) {
  const isInfoEnabled = debugLevel !== 'none';
  const isVerboseEnabled = debugLevel === 'verbose';

  if (item.isFile) {
    const file = await getFile(item as FileSystemFileEntry);
    if (!file) {
      if (isVerboseEnabled) {
        console.debug('FileSystemEntry.getFile() error', item);
      }
      return;
    }
    if (callbackAccept(file)) {
      output.push({
        type: 'file',
        file,
        path: parent.join(file.name),
      });
    }
    return;
  }

  if (!item.isDirectory) {
    // ignore
    return;
  }

  output.push({
    type: 'dir',
    path: parent.join(item.name),
  });

  const newParent = parent.join(item.name);
  if (isInfoEnabled) {
    console.log(
      `🔍 Traversing directory (Entry API): ${item.name} at path: ${newParent.toString()}`,
    );
  }

  // 디렉토리 내부의 모든 엔트리를 재귀적으로 읽음
  const children = await readEntries(item as FileSystemDirectoryEntry, debugLevel);
  if (isVerboseEnabled) {
    console.log(`  📊 Total children found: ${children.length}`);
  }

  if (isVerboseEnabled) {
    children.forEach((child, index) => {
      console.log(`  📄 Found [${index}]: ${child.name} (${child.isFile ? 'file' : 'directory'})`);
    });
  }

  // 자체 구현한 parallelMap을 사용하여 성능 최적화
  const { simpleParallelMap } = await import('../../utils/parallel-map.js');

  const normalizedConcurrency = Math.max(1, concurrency);
  const shouldParallel = parallel && normalizedConcurrency > 1 && children.length > 1;

  if (shouldParallel) {
    // 여러 파일/디렉토리가 있으면 병렬 처리로 성능 향상
    if (isInfoEnabled) {
      console.log(
        `  ⚡ Processing ${children.length} items in parallel (custom implementation, concurrency=${normalizedConcurrency})`,
      );
    }
    await simpleParallelMap(
      children,
      async (entry: FileSystemEntry) => {
        if (entry.isFile || entry.isDirectory) {
          await visitByFileSystemEntry(
            newParent,
            entry,
            output,
            callbackAccept,
            debugLevel,
            parallel,
            normalizedConcurrency,
          );
        }
      },
      normalizedConcurrency,
    ); // 최대 4개씩 동시 처리
  } else {
    // 단일 항목은 직접 처리 (오버헤드 방지)
    if (isInfoEnabled) {
      console.log(`  📝 Processing ${children.length} item directly`);
    }
    for (const entry of children) {
      if (entry.isFile || entry.isDirectory) {
        await visitByFileSystemEntry(
          newParent,
          entry,
          output,
          callbackAccept,
          debugLevel,
          parallel,
          normalizedConcurrency,
        );
      }
    }
  }
}

async function getFile(fileEntry: FileSystemFileEntry): Promise<File | null> {
  try {
    return await new Promise((resolve, reject) => {
      fileEntry.file(
        (f) => {
          resolve(f);
        },
        (err) => {
          reject(err);
        },
      );
    });
  } catch {
    return null;
  }
}

async function readEntries(
  item: FileSystemDirectoryEntry,
  debugLevel: DebugLevel = 'none',
): Promise<FileSystemEntry[]> {
  try {
    return await readAllEntries(item, debugLevel);
  } catch (err) {
    if (debugLevel === 'verbose') {
      console.debug(errmsg(err));
    }
    return [];
  }
}
async function readAllEntries(
  item: FileSystemDirectoryEntry,
  debugLevel: DebugLevel = 'none',
): Promise<FileSystemEntry[]> {
  const dirReader = item.createReader();
  let allEntries: FileSystemEntry[] = [];

  async function readEntriesRecursively() {
    return new Promise<FileSystemEntry[]>((resolve, reject) => {
      dirReader.readEntries(
        (entries) => {
          if (entries.length > 0) {
            allEntries = allEntries.concat(entries);
            // 아직 더 읽을 파일이 남아 있을 수 있으므로 재귀적으로 호출
            resolve(readEntriesRecursively());
          } else {
            // 더 이상 읽을 엔트리가 없으면 전체 리스트 반환
            resolve(allEntries);
          }
        },
        (err) => {
          if (debugLevel !== 'none') {
            console.warn('XXX readEntries() error', err);
          }
          reject(err);
        },
      );
    });
  }

  await readEntriesRecursively();
  return allEntries;
}
