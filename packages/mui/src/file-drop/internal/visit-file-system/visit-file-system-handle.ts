import type { DebugLevel } from '../../types.js';
import type { PathHolder } from '../path-util.js';
import type { PathAndEntry } from './internal-types.js';

export async function visitByFileSystemHandle(
  parent: PathHolder,
  handle: FileSystemHandle,
  output: PathAndEntry[],
  callbackAccept: (file: File) => boolean,
  debugLevel: DebugLevel = 'none',
  parallel = true,
  concurrency = 4,
) {
  const isInfoEnabled = debugLevel !== 'none';
  const isVerboseEnabled = debugLevel === 'verbose';

  if (handle.kind === 'file') {
    const file = (await (handle as FileSystemFileHandle).getFile()) as File | null;
    if (!file) {
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

  if (handle.kind !== 'directory') {
    // ignore not file or directory
    return;
  }

  output.push({
    type: 'dir',
    path: parent.join(handle.name),
  });

  const newParent = parent.join(handle.name);
  try {
    // FileSystemDirectoryHandle의 values()는 async iterator를 반환
    const children: FileSystemHandle[] = [];
    // FileSystemDirectoryHandle.values()는 일부 환경의 표준 타입에 없을 수 있으므로 단언 사용
    const iterator = (handle as FileSystemDirectoryHandle).values();

    if (isInfoEnabled) {
      console.log(`🔍 Traversing directory: ${handle.name} at path: ${newParent.toString()}`);
    }

    // async iterator를 배열로 변환
    for await (const entry of iterator) {
      if (entry) {
        children.push(entry);
        if (isVerboseEnabled) {
          console.log(`  📄 Found: ${entry.name} (${entry.kind})`);
        }
      }
    }

    if (isVerboseEnabled) {
      console.log(`  📊 Total children found: ${children.length}`);
    }

    // 자체 구현한 parallelMap 사용
    const { simpleParallelMap } = await import('../../utils/parallel-map.js');

    const normalizedConcurrency = Math.max(1, concurrency);
    const shouldParallel = parallel && normalizedConcurrency > 1 && children.length > 1;

    if (shouldParallel) {
      // 병렬 처리
      if (isInfoEnabled) {
        console.log(
          `  ⚡ Processing ${children.length} items in parallel (custom implementation, concurrency=${normalizedConcurrency})`,
        );
      }
      await simpleParallelMap(
        children,
        async (entry: FileSystemHandle) => {
          if (entry.kind === 'file' || entry.kind === 'directory') {
            await visitByFileSystemHandle(
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
      );
    } else {
      // 단일 항목은 직접 처리
      if (isInfoEnabled) {
        console.log(`  📝 Processing ${children.length} item directly`);
      }
      for (const entry of children) {
        if (entry.kind === 'file' || entry.kind === 'directory') {
          await visitByFileSystemHandle(
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
  } catch (err) {
    if (isInfoEnabled) {
      console.error(`❌ Directory traversal error for ${handle.name}:`, err);
    }
  }
}
