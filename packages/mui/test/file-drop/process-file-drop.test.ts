import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { FileDropOptions, ProcessResult } from '../../src/file-drop/index.js';
import {
  FileDropError,
  FilterPresets,
  processFileTreeDrop,
  processFileTreeDropSafe,
} from '../../src/file-drop/index.js';

const createMockFile = (name: string, size: number = 1024): File => {
  return new File(['x'.repeat(size)], name, { type: 'text/plain' });
};

const createMockFileList = (files: File[]): FileList => {
  const fileList = {
    length: files.length,
    item: (index: number) => files[index] || null,
    [Symbol.iterator]: function* () {
      for (let i = 0; i < files.length; i++) {
        yield files[i];
      }
    },
  } as FileList & { [index: number]: File };

  // Add indexable properties
  files.forEach((file, index) => {
    fileList[index] = file;
  });

  return fileList;
};

describe('processFileTreeDrop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 파일 처리', () => {
    test('FileList 처리', async () => {
      const files = [createMockFile('test1.txt', 100), createMockFile('test2.js', 200)];
      const fileList = createMockFileList(files);

      const result = await processFileTreeDrop(fileList);

      expect(result.files).toHaveLength(2);
      expect(result.files[0].name).toBe('test1.txt');
      expect(result.files[0].size).toBe(100);
      expect(result.files[1].name).toBe('test2.js');
      expect(result.files[1].size).toBe(200);

      expect(result.metadata.totalFiles).toBe(2);
      expect(result.metadata.totalSize).toBe(300);
      expect(result.errors).toHaveLength(0);
    });

    test('File 배열 처리', async () => {
      const files = [new File(['test content'], 'test.md', { type: '' })];

      const result = await processFileTreeDrop(files);

      expect(result.files).toHaveLength(1);
      expect(result.files[0].name).toBe('test.md');
      expect(result.files[0].extension).toBe('.md');
      expect(result.files[0].mimeType).toBe('text/markdown');
    });

    test('빈 파일 리스트 처리', async () => {
      const result = await processFileTreeDrop([]);

      expect(result.files).toHaveLength(0);
      expect(result.directories).toHaveLength(0);
      expect(result.metadata.totalFiles).toBe(0);
    });
  });

  describe('필터링', () => {
    test('파일 크기 제한', async () => {
      const files = [createMockFile('small.txt', 500), createMockFile('large.txt', 1500)];

      const options: FileDropOptions = {
        filter: {
          maxSize: 1000,
        },
      };

      const result = await processFileTreeDrop(files, options);

      expect(result.files).toHaveLength(1);
      expect(result.files[0].name).toBe('small.txt');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('FILE_TOO_LARGE');
    });

    test('확장자 필터링', async () => {
      const files = [
        createMockFile('test.txt'),
        createMockFile('test.js'),
        createMockFile('test.png'),
      ];

      const options: FileDropOptions = {
        filter: {
          allowedExtensions: ['.txt', '.js'],
        },
      };

      const result = await processFileTreeDrop(files, options);

      expect(result.files).toHaveLength(2);
      expect(result.files.map((f) => f.name)).toEqual(['test.txt', 'test.js']);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('INVALID_FILE_TYPE');
    });

    test('파일 개수 제한', async () => {
      const files = [
        createMockFile('file1.txt'),
        createMockFile('file2.txt'),
        createMockFile('file3.txt'),
      ];

      const options: FileDropOptions = {
        filter: {
          maxFiles: 2,
        },
      };

      const result = await processFileTreeDrop(files, options);

      expect(result.files).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('TOO_MANY_FILES');
    });

    test('커스텀 필터 함수', async () => {
      const files = [createMockFile('keep.txt'), createMockFile('reject.txt')];

      const options: FileDropOptions = {
        filter: {
          accept: (item) => item.name.includes('keep'),
        },
      };

      const result = await processFileTreeDrop(files, options);

      expect(result.files).toHaveLength(1);
      expect(result.files[0].name).toBe('keep.txt');
    });
  });

  describe('콜백 함수', () => {
    test('진행 상황 콜백', async () => {
      const files = [createMockFile('test1.txt'), createMockFile('test2.txt')];
      const onProgress = vi.fn();

      const options: FileDropOptions = {
        callbacks: { onProgress },
      };

      await processFileTreeDrop(files, options);

      expect(onProgress).toHaveBeenCalled();
      const lastCall = onProgress.mock.calls[onProgress.mock.calls.length - 1][0];
      expect(lastCall.percentage).toBe(100);
      expect(lastCall.processedItems).toBe(2);
    });

    test('파일 처리 콜백', async () => {
      const files = [createMockFile('test.txt')];
      const onFile = vi.fn();

      const options: FileDropOptions = {
        callbacks: { onFile },
      };

      await processFileTreeDrop(files, options);

      expect(onFile).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test.txt',
          type: 'file',
        }),
      );
    });

    test('에러 콜백', async () => {
      const files = [createMockFile('large.txt', 2000)];
      const onError = vi.fn();

      const options: FileDropOptions = {
        filter: { maxSize: 1000 },
        callbacks: { onError },
      };

      await processFileTreeDrop(files, options);

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'FILE_TOO_LARGE',
        }),
        expect.objectContaining({
          name: 'large.txt',
        }),
      );
    });
  });

  describe('중단 신호', () => {
    test('AbortSignal 지원', async () => {
      const controller = new AbortController();
      const files = [createMockFile('test.txt')];

      // 즉시 중단
      controller.abort();

      await expect(processFileTreeDrop(files, { signal: controller.signal })).rejects.toThrow(
        'Operation aborted',
      );
    });
  });

  describe('필터 프리셋', () => {
    test('이미지만 허용 프리셋', async () => {
      const files = [createMockFile('image.png'), createMockFile('document.txt')];

      const options: FileDropOptions = {
        filter: FilterPresets.imagesOnly(),
      };

      const result = await processFileTreeDrop(files, options);

      expect(result.files).toHaveLength(1);
      expect(result.files[0].name).toBe('image.png');
    });

    test('텍스트만 허용 프리셋', async () => {
      const files = [
        createMockFile('readme.md'),
        createMockFile('script.js'),
        createMockFile('image.png'),
      ];

      const options: FileDropOptions = {
        filter: FilterPresets.textOnly(),
      };

      const result = await processFileTreeDrop(files, options);

      expect(result.files).toHaveLength(2);
      expect(result.files.map((f) => f.name)).toEqual(['readme.md', 'script.js']);
    });
  });

  describe('트리 구조', () => {
    test('파일 트리 생성', async () => {
      const files = [createMockFile('test.txt')];

      const result = await processFileTreeDrop(files);

      expect(result.tree).toBeDefined();
      expect(result.tree.type).toBe('directory');
      expect(result.tree.children).toBeDefined();
    });
  });

  describe('메타데이터', () => {
    test('처리 시간 기록', async () => {
      const files = [createMockFile('test.txt')];

      const result = await processFileTreeDrop(files);

      expect(result.metadata.processingTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.metadata.processingTime).toBe('number');
    });

    test('통계 정보', async () => {
      const files = [createMockFile('file1.txt', 100), createMockFile('file2.txt', 200)];

      const result = await processFileTreeDrop(files);

      expect(result.metadata.totalFiles).toBe(2);
      expect(result.metadata.totalDirectories).toBe(0);
      expect(result.metadata.totalSize).toBe(300);
    });
  });
});

describe('processFileTreeDropSafe', () => {
  test('정상 처리 시 결과 반환', async () => {
    const files = [createMockFile('test.txt')];

    const result = await processFileTreeDropSafe(files);

    expect(result).not.toHaveProperty('success');
    expect(result).toHaveProperty('files');
    expect((result as ProcessResult).files).toHaveLength(1);
  });

  test('에러 발생 시 에러 결과 반환', async () => {
    const invalidSource = null as unknown as FileList;

    const result = await processFileTreeDropSafe(invalidSource);

    expect(result).toHaveProperty('success', false);
    expect(result).toHaveProperty('error');
    if ('error' in result) {
      expect(result.error).toBeInstanceOf(FileDropError);
    }
  });
});
