import { PathHolder } from './internal/path-util.js';
import { traverseTree } from './internal/traverse-tree.js';
import type { PathAndEntry } from './internal/visit-file-system/internal-types.js';
import type {
  DebugLevel,
  FileDropOptions,
  FileDropSource,
  FileItem,
  ProcessedDirectory,
  ProcessedFile,
  ProcessingOptions,
  ProcessResult,
  SafeProcessResult,
} from './types.js';
import { FileDropError } from './types.js';
import { buildFileTree, createFileItem } from './utils/file-utils.js';
import { FileFilter } from './utils/filter.js';
import { ProgressTracker } from './utils/progress-tracker.js';

/**
 * 다양한 파일 드롭 소스를 내부적으로 처리 가능한 형태로 정규화
 * React DragEvent, FileList, FileSystemHandle[] 등을 통합 처리
 *
 * @internal
 * @param source - 정규화할 파일 드롭 소스
 * @returns 정규화된 File[] 또는 FileSystemHandle[] 배열, 실패시 null
 */
async function normalizeSource(
  source: FileDropSource,
): Promise<File[] | FileSystemHandle[] | null> {
  if ('dataTransfer' in source) {
    // React DragEvent - 드래그앤드롭 이벤트 처리
    const supportsFileSystemAccessAPI = 'getAsFileSystemHandle' in DataTransferItem.prototype;
    const supportsWebkitGetAsEntry = 'webkitGetAsEntry' in DataTransferItem.prototype;

    // 브라우저가 고급 파일 API를 지원하지 않으면 기본 파일 리스트만 반환
    if (!supportsFileSystemAccessAPI && !supportsWebkitGetAsEntry) {
      return Array.from(source.dataTransfer.files);
    }

    // 브라우저 능력에 따라 적절한 API 사용
    // Chrome: getAsFileSystemHandle (최신)
    // Firefox/Safari: webkitGetAsEntry (레거시)
    const handles = Array.from(source.dataTransfer.items)
      .filter((item) => item.kind === 'file') // 파일 아이템만 필터링
      .map((item) => {
        if (supportsWebkitGetAsEntry) {
          return item.webkitGetAsEntry(); // 레거시 웹킷 API 사용
        } else if (supportsFileSystemAccessAPI) {
          // File System Access API - getAsFileSystemHandle은 표준 타입에 없음
          return (
            item as DataTransferItem & { getAsFileSystemHandle(): Promise<FileSystemHandle> }
          ).getAsFileSystemHandle();
        }
        return item.getAsFile(); // fallback
      })
      .filter(Boolean); // null/undefined 제거

    const resolvedHandles = await Promise.all(
      handles.map((handle) => {
        if (handle && handle instanceof Promise) {
          return handle;
        }
        return Promise.resolve(handle);
      }),
    );

    return resolvedHandles.filter(Boolean) as FileSystemHandle[];
  }

  if ('length' in source) {
    // FileList 또는 File[]
    return Array.from(source as FileList);
  }

  if (Array.isArray(source)) {
    // FileSystemHandle[]
    return source;
  }

  return null;
}

/**
 * 파일 핸들들을 순회하며 파일 트리를 처리
 * FileSystemHandle, FileSystemEntry, File 객체들을 병렬로 처리하여 성능 최적화
 *
 * @internal
 * @param handles - 처리할 파일/디렉토리 핸들 배열
 * @param filter - 파일 필터링 객체
 * @param tracker - 진행상황 추적 객체
 * @param callbacks - 콜백 함수들
 * @param signal - 중단 신호 (optional)
 * @returns 처리된 파일, 디렉토리, 에러 정보
 */
async function processFileTree(
  handles: (FileSystemHandle | FileSystemEntry | File)[],
  filter: FileFilter,
  tracker: ProgressTracker,
  callbacks: FileDropOptions['callbacks'] = {},
  signal?: AbortSignal,
  debugLevel: DebugLevel = 'none',
  processing?: ProcessingOptions,
): Promise<{ items: ProcessedFile[]; directories: ProcessedDirectory[]; errors: FileDropError[] }> {
  const output: PathAndEntry[] = [];
  const errors: FileDropError[] = [];
  let totalFilesEncountered = 0;

  // 자체 구현한 parallelMap 사용
  const { simpleParallelMap } = await import('./utils/parallel-map.js');

  const normalizedConcurrency = Math.max(1, processing?.concurrency ?? 4);
  const enableParallel = processing?.parallel ?? true;
  const isInfoEnabled = debugLevel !== 'none';
  const isVerboseEnabled = debugLevel === 'verbose';

  const processHandle = async (handle: FileSystemHandle | FileSystemEntry | File) => {
    if (signal?.aborted) {
      throw new FileDropError('UNKNOWN', undefined, 'Operation aborted');
    }

    try {
      await traverseTree(
        PathHolder.EMPTY,
        handle,
        output,
        (file: File) => {
          totalFilesEncountered++;
          tracker.updateTotalItems(totalFilesEncountered);
          const item = createFileItem(file, file.name);
          tracker.setCurrentItem(item);

          const filterResult = filter.filter(item);
          if (filterResult.error) {
            errors.push(filterResult.error);
            callbacks.onError?.(filterResult.error, item);
          }

          if (!filterResult.accepted) {
            tracker.completeItem();
          }

          return filterResult.accepted;
        },
        debugLevel,
        enableParallel,
        normalizedConcurrency,
      );
    } catch (error) {
      const fileError =
        error instanceof FileDropError
          ? error
          : new FileDropError('UNKNOWN', undefined, String(error));
      errors.push(fileError);
      callbacks.onError?.(fileError);
    }
  };

  // 병렬 또는 순차 처리
  const shouldProcessInParallel = enableParallel && normalizedConcurrency > 1 && handles.length > 1;

  if (shouldProcessInParallel) {
    if (isInfoEnabled) {
      console.log(
        `🚀 Processing ${handles.length} handles in parallel (custom implementation, concurrency=${normalizedConcurrency})`,
      );
    }
    await simpleParallelMap(handles, processHandle, normalizedConcurrency);
  } else {
    if (isInfoEnabled) {
      console.log(`📝 Processing ${handles.length} handle directly`);
    }
    for (const handle of handles) {
      await processHandle(handle);
    }
  }

  // 결과 변환
  const items: ProcessedFile[] = [];
  const directories: ProcessedDirectory[] = [];

  tracker.updateTotalItems(totalFilesEncountered);

  if (isInfoEnabled) {
    console.log(`🔄 Processing ${output.length} total items from traversal`);
  }

  for (const entry of output) {
    if (entry.type === 'file') {
      const processedFile = createFileItem(
        entry.file,
        entry.path.toString(),
        entry.path.toString(),
      );
      items.push(processedFile);
      callbacks.onFile?.(processedFile);
      tracker.completeItem();
      if (isVerboseEnabled) {
        console.log(`  ✅ File: ${entry.path.toString()}`);
      }
    } else {
      const directory: ProcessedDirectory = {
        type: 'directory',
        name: entry.path.lastSegment(),
        path: entry.path.toString(),
        pathSegments: entry.path.segments,
        relativePath: entry.path.toString(),
      };
      directories.push(directory);
      if (isVerboseEnabled) {
        console.log(`  📁 Directory: ${entry.path.toString()}`);
      }
    }
  }

  if (isInfoEnabled) {
    console.log(`📊 Final results: ${items.length} files, ${directories.length} directories`);
  }

  return { items, directories, errors };
}

/**
 * 파일 드래그앤드롭 이벤트를 처리하여 파일 트리를 순회하는 메인 API 함수
 *
 * React 드래그 이벤트, FileList, FileSystemHandle 배열 등 다양한 소스를 지원하며,
 * 깊은 디렉토리 구조도 완전히 순회합니다. 병렬 처리로 성능을 최적화하고,
 * 부분 실패시에도 처리 가능한 파일들은 계속 처리합니다.
 *
 * @example
 * ```tsx
 * // 기본 사용법
 * const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
 *   event.preventDefault();
 *
 *   try {
 *     const result = await processFileTreeDrop(event);
 *     console.log(`처리된 파일: ${result.files.length}개`);
 *     console.log(`처리 시간: ${result.metadata.processingTime}ms`);
 *   } catch (error) {
 *     console.error('파일 처리 중 오류:', error);
 *   }
 * };
 * ```
 *
 * @example
 * ```tsx
 * // 고급 옵션 사용
 * const result = await processFileTreeDrop(event, {
 *   filter: {
 *     maxSize: 10 * 1024 * 1024, // 10MB 제한
 *     maxFiles: 50,              // 최대 50개 파일
 *     allowedExtensions: ['.jpg', '.png', '.gif']
 *   },
 *   callbacks: {
 *     onProgress: (progress) => {
 *       console.log(`진행률: ${progress.percentage}%`);
 *     },
 *     onError: (error, item) => {
 *       console.error(`${item?.name} 처리 실패:`, error.message);
 *     }
 *   },
 *   signal: abortController.signal // 취소 가능
 * });
 * ```
 *
 * @param source - 파일 드롭 소스 (React DragEvent, FileList, FileSystemHandle[], File[])
 * @param options - 처리 옵션 (필터링, 콜백, 중단 신호 등)
 *
 * @returns Promise<ProcessResult> - 처리된 파일들, 디렉토리 구조, 메타데이터, 에러 정보
 *
 * @throws {FileDropError} 전체 처리가 실패한 경우
 * - 'UNSUPPORTED_API': 브라우저가 File API를 지원하지 않음
 * - 'ACCESS_DENIED': 파일 접근 권한이 거부됨
 * - 'UNKNOWN': 기타 알 수 없는 오류
 *
 * @see {@link processFileTreeDropSafe} 에러를 예외로 던지지 않는 안전한 버전
 * @see {@link FileDropOptions} 사용 가능한 모든 옵션
 * @see {@link ProcessResult} 반환 데이터 구조
 *
 * @since 1.0.0
 */
export async function processFileTreeDrop(
  source: FileDropSource,
  options: FileDropOptions = {},
): Promise<ProcessResult> {
  const startTime = Date.now();
  const debugLevel = normalizeDebugLevel(options.debug);

  try {
    // 중단 신호 확인
    if (options.signal?.aborted) {
      throw new FileDropError('UNKNOWN', undefined, 'Operation aborted');
    }

    // 소스 정규화
    const normalized = await normalizeSource(source);
    if (!normalized) {
      throw new FileDropError('UNSUPPORTED_API', undefined, 'Unsupported file drop source');
    }

    // 초기 파일 개수 추정
    const estimatedCount = normalized.length;
    const tracker = new ProgressTracker(estimatedCount, options.callbacks);
    const filter = new FileFilter(options.filter);

    // 단순 파일 리스트인 경우
    if (normalized.length > 0 && normalized[0] instanceof File) {
      const files = normalized as File[];
      const items: ProcessedFile[] = [];
      const errors: FileDropError[] = [];

      for (const file of files) {
        if (options.signal?.aborted) {
          throw new FileDropError('UNKNOWN', undefined, 'Operation aborted');
        }

        const item = createFileItem(file, file.name);
        tracker.setCurrentItem(item);

        const filterResult = filter.filter(item);
        if (filterResult.accepted) {
          items.push(item);
          options.callbacks?.onFile?.(item);
        } else if (filterResult.error) {
          errors.push(filterResult.error);
          options.callbacks?.onError?.(filterResult.error, item);
        }

        tracker.completeItem();
      }

      // 트리 빌드
      const tree = buildFileTree(items);

      return {
        files: items,
        directories: [],
        tree,
        metadata: {
          totalFiles: items.length,
          totalDirectories: 0,
          totalSize: items.reduce((sum, item) => sum + (item.size || 0), 0),
          processingTime: Date.now() - startTime,
        },
        errors,
      };
    }

    // FileSystemHandle 처리
    const { items, directories, errors } = await processFileTree(
      normalized as FileSystemHandle[],
      filter,
      tracker,
      options.callbacks,
      options.signal,
      debugLevel,
      options.processing,
    );

    // 트리 빌드
    const allItems: FileItem[] = [...items, ...directories];
    const tree = buildFileTree(allItems);

    const result: ProcessResult = {
      files: items,
      directories,
      tree,
      metadata: {
        totalFiles: items.length,
        totalDirectories: directories.length,
        totalSize: items.reduce((sum, item) => sum + (item.size || 0), 0),
        processingTime: Date.now() - startTime,
      },
      errors,
    };

    return result;
  } catch (error) {
    const fileError =
      error instanceof FileDropError
        ? error
        : new FileDropError('UNKNOWN', undefined, String(error));

    throw fileError;
  }
}

/**
 * 안전한 버전의 파일 트리 처리 함수
 *
 * processFileTreeDrop과 동일한 기능을 제공하지만, 에러를 예외로 던지지 않고
 * 결과 객체에 포함시켜 반환합니다. 에러 처리가 복잡한 상황이나
 * 부분 실패를 허용해야 하는 경우에 유용합니다.
 *
 * @example
 * ```tsx
 * // 에러를 안전하게 처리
 * const result = await processFileTreeDropSafe(event, options);
 *
 * if ('error' in result) {
 *   // 실패한 경우
 *   console.error('처리 실패:', result.error.message);
 *   console.log('에러 코드:', result.error.code);
 *
 *   // 부분적으로 처리된 결과가 있다면 활용
 *   if (result.partialResult) {
 *     console.log('부분 결과:', result.partialResult.files.length, '개 파일');
 *   }
 * } else {
 *   // 성공한 경우
 *   console.log('처리 성공:', result.files.length, '개 파일');
 *   console.log('처리 시간:', result.metadata.processingTime, 'ms');
 * }
 * ```
 *
 * @example
 * ```tsx
 * // try-catch 없이 에러 처리
 * const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
 *   event.preventDefault();
 *
 *   const result = await processFileTreeDropSafe(event, {
 *     filter: { maxSize: 5 * 1024 * 1024 }, // 5MB 제한
 *     callbacks: {
 *       onError: (error, item) => {
 *         // 개별 파일 에러는 여기서 처리
 *         console.warn(`${item?.name} 건너뜀:`, error.message);
 *       }
 *     }
 *   });
 *
 *   // 타입 가드를 사용한 안전한 처리
 *   if ('error' in result) {
 *     setError(result.error.message);
 *   } else {
 *     setFiles(result.files);
 *     setProcessingTime(result.metadata.processingTime);
 *   }
 * };
 * ```
 *
 * @param source - 파일 드롭 소스 (React DragEvent, FileList, FileSystemHandle[], File[])
 * @param options - 처리 옵션 (필터링, 콜백, 중단 신호 등)
 *
 * @returns Promise<SafeProcessResult> - 성공시 ProcessResult, 실패시 ErrorResult
 * - 성공: ProcessResult와 동일한 구조
 * - 실패: { success: false, error: FileDropError, partialResult?: ProcessResult }
 *
 * @see {@link processFileTreeDrop} 에러를 예외로 던지는 기본 버전
 * @see {@link SafeProcessResult} 반환 타입 상세 정보
 * @see {@link ErrorResult} 실패시 반환 구조
 *
 * @since 1.0.0
 */
export async function processFileTreeDropSafe(
  source: FileDropSource,
  options: FileDropOptions = {},
): Promise<SafeProcessResult> {
  try {
    const result = await processFileTreeDrop(source, options);
    return result;
  } catch (error) {
    const fileError =
      error instanceof FileDropError
        ? error
        : new FileDropError('UNKNOWN', undefined, String(error));

    return {
      success: false,
      error: fileError,
    };
  }
}

function normalizeDebugLevel(debug: FileDropOptions['debug']): DebugLevel {
  if (debug === true) return 'verbose';
  if (debug === false || debug === undefined) return 'none';
  return debug;
}
