import type { FileItem, FilterOptions, ProcessedFile } from '../types.js';
import { FileDropError } from '../types.js';
import { isValidFileSize, isValidFileType } from './file-utils.js';

/**
 * 파일 필터링 결과
 */
export interface FilterResult {
  accepted: boolean;
  error?: FileDropError;
}

/**
 * 파일 필터
 */
export class FileFilter {
  private options: FilterOptions;
  private fileCount: number = 0;

  constructor(options: FilterOptions = {}) {
    this.options = options;
  }

  /**
   * 파일 아이템 필터링
   */
  filter(item: FileItem): FilterResult {
    // 디렉토리 제외 옵션 확인
    if (this.options.excludeDirectories && item.type === 'directory') {
      return { accepted: false };
    }

    // 파일만 추가 검증
    if (item.type === 'file') {
      const file = (item as ProcessedFile).file;

      // 파일 개수 제한
      if (this.options.maxFiles && this.fileCount >= this.options.maxFiles) {
        return {
          accepted: false,
          error: new FileDropError(
            'TOO_MANY_FILES',
            item,
            `Maximum ${this.options.maxFiles} files allowed`,
          ),
        };
      }

      // 파일 크기 제한
      if (this.options.maxSize && !isValidFileSize(file, this.options.maxSize)) {
        return {
          accepted: false,
          error: new FileDropError(
            'FILE_TOO_LARGE',
            item,
            `File size ${file.size} exceeds limit ${this.options.maxSize}`,
          ),
        };
      }

      // 확장자 제한
      if (
        this.options.allowedExtensions &&
        !isValidFileType(file, this.options.allowedExtensions)
      ) {
        return {
          accepted: false,
          error: new FileDropError(
            'INVALID_FILE_TYPE',
            item,
            `File type not allowed: ${file.name}`,
          ),
        };
      }

      this.fileCount++;
    }

    // 커스텀 필터 함수
    if (this.options.accept && !this.options.accept(item)) {
      return { accepted: false };
    }

    return { accepted: true };
  }

  /**
   * 현재 파일 개수
   */
  get currentFileCount(): number {
    return this.fileCount;
  }

  /**
   * 필터 초기화
   */
  reset() {
    this.fileCount = 0;
  }
}

/**
 * 파일 리스트 필터링
 */
export function filterFiles(
  items: FileItem[],
  options: FilterOptions = {},
): { accepted: FileItem[]; rejected: FileItem[]; errors: FileDropError[] } {
  const filter = new FileFilter(options);
  const accepted: FileItem[] = [];
  const rejected: FileItem[] = [];
  const errors: FileDropError[] = [];

  for (const item of items) {
    const result = filter.filter(item);

    if (result.accepted) {
      accepted.push(item);
    } else {
      rejected.push(item);
      if (result.error) {
        errors.push(result.error);
      }
    }
  }

  return { accepted, rejected, errors };
}

/**
 * 기본 필터 프리셋
 */
export const FilterPresets = {
  /**
   * 이미지만 허용
   */
  imagesOnly: (): FilterOptions => ({
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'],
    excludeDirectories: true,
  }),

  /**
   * 텍스트 파일만 허용
   */
  textOnly: (): FilterOptions => ({
    allowedExtensions: ['.txt', '.md', '.json', '.js', '.ts', '.html', '.css'],
    excludeDirectories: true,
  }),

  /**
   * 작은 파일만 허용 (1MB 이하)
   */
  smallFilesOnly: (): FilterOptions => ({
    maxSize: 1024 * 1024,
    excludeDirectories: true,
  }),

  /**
   * 개발 파일만 허용
   */
  developmentFiles: (): FilterOptions => ({
    allowedExtensions: [
      '.js',
      '.ts',
      '.tsx',
      '.jsx',
      '.json',
      '.md',
      '.html',
      '.css',
      '.scss',
      '.py',
      '.java',
      '.cpp',
      '.c',
      '.h',
      '.yml',
      '.yaml',
      '.toml',
    ],
  }),
};
