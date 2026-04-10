// 새로운 API

// 기존 API (호환성 유지)
export { handleFileTreeDropEvent } from './handle-file-tree-drop.js';
export * from './internal/path-util.js';
export { processFileTreeDrop, processFileTreeDropSafe } from './process-file-drop.js';
// 타입 exports
export type {
  CallbackOptions,
  DebugLevel,
  FileDropOptions,
  FileDropSource,
  FileItem,
  FileMetadata,
  FileTreeNode,
  FilterOptions,
  LegacyFileItem,
  ProcessedDirectory,
  ProcessedFile,
  ProcessingOptions,
  ProcessResult,
  ProgressInfo,
  SafeProcessResult,
} from './types.js';
// 에러 클래스
export { FileDropError } from './types.js';
// 유틸리티 함수들
export {
  buildFileTree,
  FilePathUtils,
  filterTree,
  findInTree,
  flattenTree,
  isValidFileName,
  isValidFileSize,
  isValidFileType,
} from './utils/file-utils.js';
// 필터 프리셋
export { FilterPresets } from './utils/filter.js';
