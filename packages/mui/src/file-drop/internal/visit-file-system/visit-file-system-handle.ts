import type { DebugLevel } from '../../types.js';
import { createFileDropLogger } from '../debug-logger.js';
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
  const logger = createFileDropLogger(debugLevel);

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
    // 파일이나 디렉터리가 아닌 핸들은 순회 대상에서 제외한다.
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
    // FileSystemDirectoryHandle.values()는 일부 환경의 표준 타입에 없을 수 있으므로 인터페이스 확장 사용
    const directoryHandle = handle as FileSystemDirectoryHandle & {
      values(): AsyncIterableIterator<FileSystemHandle>;
    };
    const iterator = directoryHandle.values();

    logger.info(`🔍 Traversing directory: ${handle.name} at path: ${newParent.toString()}`);

    // async iterator를 배열로 변환
    for await (const entry of iterator) {
      if (entry) {
        children.push(entry);
        logger.verbose(`  📄 Found: ${entry.name} (${entry.kind})`);
      }
    }

    logger.verbose(`  📊 Total children found: ${children.length}`);

    // 자체 구현한 parallelMap 사용
    const { simpleParallelMap } = await import('../../utils/parallel-map.js');

    const normalizedConcurrency = Math.max(1, concurrency);
    const shouldParallel = parallel && normalizedConcurrency > 1 && children.length > 1;

    if (shouldParallel) {
      // 병렬 처리
      logger.info(
        `  ⚡ Processing ${children.length} items in parallel (custom implementation, concurrency=${normalizedConcurrency})`,
      );
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
      logger.info(`  📝 Processing ${children.length} item directly`);
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
    logger.warn(`Directory traversal warning for ${handle.name}:`, err);
  }
}
