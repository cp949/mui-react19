/**
 * 기본 파일/디렉토리 아이템을 나타내는 인터페이스
 *
 * @example
 * ```ts
 * const item: FileItem = {
 *   type: 'file',
 *   name: 'example.txt',
 *   path: '/folder/example.txt',
 *   pathSegments: ['folder', 'example.txt'],
 *   size: 1024,
 *   lastModified: new Date(),
 *   relativePath: 'folder/example.txt'
 * };
 * ```
 */
export interface FileItem {
  /** 아이템 타입 - 파일 또는 디렉토리 */
  type: 'file' | 'directory';
  /** 파일/디렉토리 이름 (확장자 포함) */
  name: string;
  /** 전체 경로 (루트부터 시작) */
  path: string;
  /** 경로를 세그먼트로 분할한 배열 */
  pathSegments: string[];
  /** 파일 크기 (바이트 단위, 디렉토리의 경우 optional) */
  size?: number;
  /** 마지막 수정 날짜 */
  lastModified?: Date;
  /** 드롭 루트로부터의 상대 경로 */
  relativePath: string;
}

/**
 * 처리 완료된 파일 정보
 * FileItem을 확장하여 실제 File 객체와 MIME 타입 정보 포함
 *
 * @example
 * ```ts
 * const processedFile: ProcessedFile = {
 *   type: 'file',
 *   name: 'image.jpg',
 *   file: fileObject,
 *   mimeType: 'image/jpeg',
 *   extension: '.jpg',
 *   // ... 기타 FileItem 속성들
 * };
 * ```
 */
export interface ProcessedFile extends FileItem {
  /** 항상 'file' 타입 */
  type: 'file';
  /** 브라우저의 File 객체 */
  file: File;
  /** MIME 타입 (예: 'image/jpeg', 'text/plain') */
  mimeType: string;
  /** 파일 확장자 (점 포함, 예: '.jpg', '.txt') */
  extension: string;
}

/**
 * 처리 완료된 디렉토리 정보
 * FileItem을 확장하여 자식 요소들 포함 가능
 *
 * @example
 * ```ts
 * const processedDir: ProcessedDirectory = {
 *   type: 'directory',
 *   name: 'images',
 *   children: [file1, file2],
 *   // ... 기타 FileItem 속성들
 * };
 * ```
 */
export interface ProcessedDirectory extends FileItem {
  /** 항상 'directory' 타입 */
  type: 'directory';
  /** 하위 파일/디렉토리 목록 (optional) */
  children?: FileItem[];
}

/**
 * 파일 트리 구조를 나타내는 노드
 * 계층적 파일 시스템 구조를 트리 형태로 표현
 *
 * @example
 * ```ts
 * const treeNode: FileTreeNode = {
 *   name: 'project',
 *   type: 'directory',
 *   path: '/project',
 *   children: [
 *     {
 *       name: 'src',
 *       type: 'directory',
 *       path: '/project/src',
 *       children: [...]
 *     },
 *     {
 *       name: 'package.json',
 *       type: 'file',
 *       path: '/project/package.json',
 *       file: fileObject,
 *       metadata: { size: 1024, ... }
 *     }
 *   ]
 * };
 * ```
 */
export interface FileTreeNode {
  /** 노드 이름 */
  name: string;
  /** 노드 타입 */
  type: 'file' | 'directory';
  /** 노드의 전체 경로 */
  path: string;
  /** 자식 노드들 (디렉토리인 경우) */
  children?: FileTreeNode[];
  /** 파일 객체 (파일 노드인 경우) */
  file?: File;
  /** 파일 메타데이터 (파일 노드인 경우) */
  metadata?: FileMetadata;
}

/**
 * 파일의 메타데이터 정보
 *
 * @example
 * ```ts
 * const metadata: FileMetadata = {
 *   size: 2048,
 *   lastModified: new Date('2023-12-01'),
 *   mimeType: 'application/json',
 *   extension: '.json'
 * };
 * ```
 */
export interface FileMetadata {
  /** 파일 크기 (바이트 단위) */
  size: number;
  /** 마지막 수정 날짜 */
  lastModified: Date;
  /** MIME 타입 (optional) */
  mimeType?: string;
  /** 파일 확장자 (점 포함) */
  extension: string;
}

/**
 * 파일 처리 진행 상황 정보
 * onProgress 콜백에서 제공되는 진행률 데이터
 *
 * @example
 * ```ts
 * const progress: ProgressInfo = {
 *   totalItems: 100,
 *   processedItems: 45,
 *   currentItem: { name: 'loading.txt', ... },
 *   percentage: 45,
 *   estimatedTimeLeft: 2300
 * };
 * ```
 */
export interface ProgressInfo {
  /** 전체 처리할 아이템 수 */
  totalItems: number;
  /** 현재까지 처리된 아이템 수 */
  processedItems: number;
  /** 현재 처리 중인 아이템 (optional) */
  currentItem?: FileItem;
  /** 진행률 퍼센트 (0-100) */
  percentage: number;
  /** 예상 남은 시간 (밀리초, optional) */
  estimatedTimeLeft?: number;
}

/**
 * 파일 드롭 처리 중 발생할 수 있는 에러 코드
 *
 * @example
 * ```ts
 * // 각 에러 코드의 의미:
 * 'UNSUPPORTED_API'    // 브라우저가 File API를 지원하지 않음
 * 'FILE_TOO_LARGE'     // 파일 크기가 허용된 최대 크기 초과
 * 'ACCESS_DENIED'      // 파일 접근 권한 거부됨
 * 'INVALID_FILE_TYPE'  // 허용되지 않은 파일 형식
 * 'TOO_MANY_FILES'     // 허용된 최대 파일 수 초과
 * 'UNKNOWN'            // 기타 알 수 없는 에러
 * ```
 */
export type FileDropErrorCode =
  | 'UNSUPPORTED_API'
  | 'FILE_TOO_LARGE'
  | 'ACCESS_DENIED'
  | 'INVALID_FILE_TYPE'
  | 'TOO_MANY_FILES'
  | 'UNKNOWN';

/**
 * 파일 드롭 처리 중 발생하는 에러를 나타내는 클래스
 * 표준 Error를 확장하여 에러 코드와 관련 아이템 정보 포함
 *
 * @example
 * ```ts
 * throw new FileDropError(
 *   'FILE_TOO_LARGE',
 *   fileItem,
 *   'File size exceeds 10MB limit'
 * );
 *
 * // 에러 처리
 * try {
 *   await processFileTreeDrop(event);
 * } catch (error) {
 *   if (error instanceof FileDropError) {
 *     console.log(`Error code: ${error.code}`);
 *     console.log(`Failed item: ${error.item?.name}`);
 *   }
 * }
 * ```
 */
export class FileDropError extends Error {
  constructor(
    /** 에러 코드 */
    public code: FileDropErrorCode,
    /** 에러와 관련된 파일/디렉토리 아이템 (optional) */
    public item?: FileItem,
    /** 에러 메시지 (optional, 기본값 자동 생성) */
    message?: string,
  ) {
    super(message || `File drop error: ${code}`);
    this.name = 'FileDropError';
  }
}

/**
 * 파일 필터링 옵션
 * 처리할 파일들을 제한하고 필터링하는 설정
 *
 * @example
 * ```ts
 * const filterOptions: FilterOptions = {
 *   maxSize: 10 * 1024 * 1024, // 10MB 제한
 *   maxFiles: 50,              // 최대 50개 파일
 *   allowedExtensions: ['.jpg', '.png', '.gif'],
 *   accept: (item) => !item.name.startsWith('.'), // 숨김 파일 제외
 *   excludeDirectories: false  // 디렉토리도 포함
 * };
 * ```
 */
export interface FilterOptions {
  /** 커스텀 필터 함수 - true 반환시 파일 허용 */
  accept?: (item: FileItem) => boolean;
  /** 최대 파일 크기 (바이트 단위) */
  maxSize?: number;
  /** 최대 파일 개수 */
  maxFiles?: number;
  /** 허용할 파일 확장자 목록 (점 포함, 예: ['.jpg', '.png']) */
  allowedExtensions?: string[];
  /** true시 디렉토리 제외하고 파일만 처리 */
  excludeDirectories?: boolean;
}

/**
 * 파일 처리 옵션
 * 성능과 처리 방식을 제어하는 설정
 *
 * @example
 * ```ts
 * const processingOptions: ProcessingOptions = {
 *   parallel: true,        // 병렬 처리 활성화
 *   concurrency: 4,        // 동시 처리 수 4개
 *   preserveStructure: true // 디렉토리 구조 유지
 * };
 * ```
 */
export interface ProcessingOptions {
  /** 병렬 처리 사용 여부 (기본: true) */
  parallel?: boolean;
  /** 동시 처리할 파일 수 (기본: 4) */
  concurrency?: number;
  /** 디렉토리 구조 정보 유지 여부 (기본: true) */
  preserveStructure?: boolean;
}

/**
 * 콜백 옵션
 * 처리 과정에서 호출될 콜백 함수들
 *
 * @example
 * ```ts
 * const callbacks: CallbackOptions = {
 *   onProgress: (progress) => {
 *     console.log(`진행률: ${progress.percentage}%`);
 *   },
 *   onError: (error, item) => {
 *     console.error(`${item?.name} 처리 실패: ${error.message}`);
 *   },
 *   onFile: (file) => {
 *     console.log(`파일 처리 완료: ${file.name}`);
 *   }
 * };
 * ```
 */
export interface CallbackOptions {
  /** 진행상황 업데이트시 호출되는 콜백 */
  onProgress?: (progress: ProgressInfo) => void;
  /** 에러 발생시 호출되는 콜백 */
  onError?: (error: FileDropError, item?: FileItem) => void;
  /** 각 파일 처리 완료시 호출되는 콜백 */
  onFile?: (file: ProcessedFile) => void;
}

/**
 * processFileTreeDrop 함수의 전체 옵션
 * 모든 설정을 한 곳에서 관리
 *
 * @example
 * ```ts
 * const options: FileDropOptions = {
 *   filter: {
 *     maxSize: 10 * 1024 * 1024,
 *     allowedExtensions: ['.jpg', '.png']
 *   },
 *   processing: {
 *     parallel: true,
 *     concurrency: 4
 *   },
 *   callbacks: {
 *     onProgress: (prog) => console.log(`${prog.percentage}%`)
 *   },
 *   includeMetadata: true,
 *   signal: abortController.signal
 * };
 *
 * const result = await processFileTreeDrop(event, options);
 * ```
 */
export interface FileDropOptions {
  /** 파일 필터링 옵션 */
  filter?: FilterOptions;
  /** 처리 방식 옵션 */
  processing?: ProcessingOptions;
  /** 콜백 함수들 */
  callbacks?: CallbackOptions;
  /** 상세한 메타데이터 포함 여부 (기본: true) */
  includeMetadata?: boolean;
  /** 처리 중단을 위한 AbortSignal */
  signal?: AbortSignal;
  /**
   * 디버그 로그 출력 레벨
   * - 'none': 로그 비활성화 (기본값)
   * - 'info': 주요 단계와 요약 정보만 출력
   * - 'verbose': 파일/디렉터리 단위의 상세 로그 포함
   *
   * 기존 boolean 옵션과의 호환을 위해 true는 'verbose', false는 'none'으로 간주합니다.
   */
  debug?: DebugLevel | boolean;
}

/** 디버그 로그 출력 레벨 */
export type DebugLevel = 'none' | 'info' | 'verbose';

/**
 * 파일 트리 처리 성공 결과
 * processFileTreeDrop 함수가 정상 완료시 반환하는 데이터
 *
 * @example
 * ```ts
 * const result: ProcessResult = {
 *   files: [
 *     { name: 'image.jpg', type: 'file', file: fileObj, ... },
 *     { name: 'document.pdf', type: 'file', file: fileObj2, ... }
 *   ],
 *   directories: [
 *     { name: 'photos', type: 'directory', children: [...] }
 *   ],
 *   tree: {
 *     name: 'root',
 *     type: 'directory',
 *     children: [...] // 계층 구조
 *   },
 *   metadata: {
 *     totalFiles: 25,
 *     totalDirectories: 3,
 *     totalSize: 1024 * 1024 * 5, // 5MB
 *     processingTime: 1250 // 1.25초
 *   },
 *   errors: [] // 에러 발생시 정보 포함
 * };
 * ```
 */
export interface ProcessResult {
  /** 처리된 모든 파일들 */
  files: ProcessedFile[];
  /** 처리된 모든 디렉토리들 */
  directories: ProcessedDirectory[];
  /** 계층 구조를 나타내는 트리 */
  tree: FileTreeNode;
  /** 처리 결과 통계 정보 */
  metadata: {
    /** 총 파일 수 */
    totalFiles: number;
    /** 총 디렉토리 수 */
    totalDirectories: number;
    /** 총 파일 크기 (바이트) */
    totalSize: number;
    /** 처리 소요 시간 (밀리초) */
    processingTime: number;
  };
  /** 처리 중 발생한 에러들 (부분 실패시 포함) */
  errors: FileDropError[];
}

/**
 * 파일 트리 처리 실패 결과
 * processFileTreeDropSafe 함수에서 전체 실패시 반환
 *
 * @example
 * ```ts
 * const errorResult: ErrorResult = {
 *   success: false,
 *   error: new FileDropError('ACCESS_DENIED', item, 'Permission denied'),
 *   partialResult: { files: [...], ... } // 부분적으로 처리된 결과 (optional)
 * };
 * ```
 */
export interface ErrorResult {
  /** 항상 false (실패 표시) */
  success: false;
  /** 발생한 주요 에러 */
  error: FileDropError;
  /** 부분적으로 처리된 결과 (optional) */
  partialResult?: ProcessResult;
}

/**
 * 안전한 처리 결과 타입
 * processFileTreeDropSafe 함수의 반환 타입
 * 성공시 ProcessResult, 실패시 ErrorResult 반환
 *
 * @example
 * ```ts
 * const result: SafeProcessResult = await processFileTreeDropSafe(event);
 *
 * if ('error' in result) {
 *   // 실패한 경우
 *   console.error('처리 실패:', result.error.message);
 *   if (result.partialResult) {
 *     console.log('부분 결과:', result.partialResult.files.length);
 *   }
 * } else {
 *   // 성공한 경우
 *   console.log('처리 성공:', result.files.length, '개 파일');
 * }
 * ```
 */
export type SafeProcessResult = ProcessResult | ErrorResult;

/**
 * 지원되는 파일 드롭 소스 타입
 * processFileTreeDrop 함수가 받을 수 있는 입력 타입들
 *
 * @example
 * ```ts
 * // React 드래그 이벤트
 * const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
 *   const result = await processFileTreeDrop(event);
 * };
 *
 * // 파일 리스트
 * const fileInput = document.querySelector('input[type="file"]');
 * const result = await processFileTreeDrop(fileInput.files);
 *
 * // FileSystemHandle 배열
 * const handles: FileSystemHandle[] = [...];
 * const result = await processFileTreeDrop(handles);
 *
 * // File 객체 배열
 * const files: File[] = [...];
 * const result = await processFileTreeDrop(files);
 * ```
 */
export type FileDropSource = React.DragEvent<HTMLElement> | FileList | FileSystemHandle[] | File[];

/**
 * 레거시 API 호환성을 위한 파일 아이템 타입
 * handleFileTreeDropEvent 함수에서 사용
 *
 * @deprecated 새로운 코드에서는 FileItem 사용 권장
 *
 * @example
 * ```ts
 * // 레거시 방식 (하위 호환성용)
 * const legacyResult: LegacyFileItem[] = await handleFileTreeDropEvent(event);
 *
 * // 새로운 방식 (권장)
 * const newResult: ProcessResult = await processFileTreeDrop(event);
 * ```
 */
export interface LegacyFileItem {
  /** 아이템 타입 - 'file' 또는 'dir' */
  type: 'file' | 'dir';
  /** 파일/디렉토리 경로 */
  path: string;
  /** File 객체 (파일인 경우만) */
  file?: File;
}
