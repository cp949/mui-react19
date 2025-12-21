import { PathHolder } from './internal/path-util.js';
import { traverseTree } from './internal/traverse-tree.js';
import type { PathAndEntry } from './internal/visit-file-system/internal-types.js';

const alwaysAccept = (_file: File) => true;

/**
 * 레거시 파일 트리 드롭 이벤트 처리 함수
 *
 * @deprecated 새로운 코드에서는 `processFileTreeDrop` 또는 `processFileTreeDropSafe` 사용을 권장합니다.
 *
 * 이 함수는 하위 호환성을 위해 유지되지만 다음과 같은 제한사항이 있습니다:
 * - 에러 처리가 제한적
 * - 진행상황 추적 불가
 * - 필터링 옵션 제한적
 * - 반환 타입이 제한적
 *
 * @example
 * ```tsx
 * // ❌ 레거시 방식 (권장하지 않음)
 * const legacyResult = await handleFileTreeDropEvent(event, (file) => file.size < 1000000);
 *
 * // ✅ 새로운 방식 (권장)
 * const newResult = await processFileTreeDrop(event, {
 *   filter: { maxSize: 1000000 },
 *   callbacks: {
 *     onProgress: (prog) => console.log(`${prog.percentage}%`)
 *   }
 * });
 * ```
 *
 * @param event - React 드래그 이벤트
 * @param callbackAccept - 파일 필터링 함수 (기본: 모든 파일 허용)
 * @returns 레거시 형식의 파일/디렉토리 배열
 *
 * @see {@link processFileTreeDrop} - 권장되는 새로운 API
 * @see {@link processFileTreeDropSafe} - 안전한 에러 처리가 포함된 버전
 *
 * @since 1.0.0
 * @deprecated since 1.0.8 - Use processFileTreeDrop instead
 */
export async function handleFileTreeDropEvent(
  event: React.DragEvent<HTMLElement>,
  callbackAccept: (file: File) => boolean = alwaysAccept,
): Promise<
  Array<
    | {
        type: 'dir';
        path: string;
      }
    | {
        type: 'file';
        path: string;
        file: File;
      }
  >
> {
  const supportsFileSystemAccessAPI = 'getAsFileSystemHandle' in DataTransferItem.prototype;
  const supportsWebkitGetAsEntry = 'webkitGetAsEntry' in DataTransferItem.prototype;

  if (!supportsFileSystemAccessAPI && !supportsWebkitGetAsEntry) {
    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return [];
    return files.filter(callbackAccept).map((it) => ({
      type: 'file',
      file: it,
      path: PathHolder.from(it.name).toString(),
    }));
  }

  const output = [] as Array<PathAndEntry>;

  // WebkitGetAsEntry가 getAsFileSystemHandle보다 안정적임
  const fileHandlesPromises = Array.prototype.slice
    .call(event.dataTransfer.items)
    // …by including only files (where file misleadingly means actual file _or_ directory)…
    .filter((item) => item.kind === 'file')
    // …and, depending on previous feature detection…
    .map((item) => {
      if (supportsWebkitGetAsEntry) {
        return item.webkitGetAsEntry();
      } else if (supportsFileSystemAccessAPI) {
        return item.getAsFileSystemHandle() as Promise<FileSystemHandle | null>;
      }
      return item.getAsFile();
    })
    .filter(Boolean);

  // 자체 구현한 parallelMap 사용 (p-map 의존성 제거)
  const { simpleParallelMap } = await import('./utils/parallel-map.js');

  if (fileHandlesPromises.length > 1) {
    // 병렬 처리로 성능 최적화
    await simpleParallelMap(
      fileHandlesPromises,
      async (item: unknown) => {
        const fileHandle = item as FileSystemHandle | FileSystemEntry | File;
        await traverseTree(PathHolder.EMPTY, fileHandle, output, callbackAccept);
      },
      4,
    );
  } else {
    // 단일 항목은 직접 처리
    for (const item of fileHandlesPromises) {
      const fileHandle = item as FileSystemHandle | FileSystemEntry | File;
      await traverseTree(PathHolder.EMPTY, fileHandle, output, callbackAccept);
    }
  }

  return output.map((it) => {
    return {
      ...it,
      path: it.path.toString(),
    };
  });
}
