// 새로운 API
export { processFileTreeDrop, processFileTreeDropSafe } from './process-file-drop.js';

// 타입 exports
export type {
  FileItem,
  ProcessedFile,
  ProcessedDirectory,
  FileTreeNode,
  FileMetadata,
  ProgressInfo,
  FileDropOptions,
  FilterOptions,
  ProcessingOptions,
  CallbackOptions,
  ProcessResult,
  SafeProcessResult,
  FileDropSource,
  LegacyFileItem,
  DebugLevel,
} from './types.js';

// 에러 클래스
export { FileDropError } from './types.js';

// 유틸리티 함수들
export {
  FilePathUtils,
  isValidFileType,
  isValidFileSize,
  isValidFileName,
  flattenTree,
  filterTree,
  findInTree,
  buildFileTree,
} from './utils/file-utils.js';

// 필터 프리셋
export { FilterPresets } from './utils/filter.js';

// 기존 API (호환성 유지)
export { handleFileTreeDropEvent } from './handle-file-tree-drop.js';
export * from './internal/path-util.js';
