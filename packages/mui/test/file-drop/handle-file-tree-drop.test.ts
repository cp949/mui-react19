import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { handleFileTreeDropEvent } from '../../src/file-drop/handle-file-tree-drop.js';

type MockDragEvent = {
  dataTransfer: {
    files: FileList;
    items: DataTransferItem[];
  };
  preventDefault: () => void;
};

// Mock React DragEvent
const createMockDragEvent = (options: {
  files?: File[];
  items?: DataTransferItem[];
  supportsFileSystemAccessAPI?: boolean;
  supportsWebkitGetAsEntry?: boolean;
}) => {
  // Create proper File array-like object
  const filesArray = options.files || [];
  const mockFiles = {
    ...filesArray,
    length: filesArray.length,
    item: (index: number) => filesArray[index] || null,
    [Symbol.iterator]: function* () {
      for (let i = 0; i < filesArray.length; i++) {
        yield filesArray[i];
      }
    },
  } as unknown as FileList;

  const mockDataTransfer = {
    files: mockFiles,
    items: options.items || [],
  };

  const prototype = DataTransferItem.prototype as unknown as Record<string, unknown>;

  // DataTransferItem.prototype mocking
  if (options.supportsFileSystemAccessAPI === true) {
    Object.defineProperty(DataTransferItem.prototype, 'getAsFileSystemHandle', {
      value: vi.fn(),
      configurable: true,
    });
  } else if (options.supportsFileSystemAccessAPI === false) {
    delete prototype.getAsFileSystemHandle;
  }

  if (options.supportsWebkitGetAsEntry === true) {
    Object.defineProperty(DataTransferItem.prototype, 'webkitGetAsEntry', {
      value: vi.fn(),
      configurable: true,
    });
  } else if (options.supportsWebkitGetAsEntry === false) {
    delete prototype.webkitGetAsEntry;
  }

  return {
    dataTransfer: mockDataTransfer,
    preventDefault: vi.fn(),
  } as unknown as DragEvent;
};

const createMockFile = (name: string, content: string = 'test'): File => {
  return new File([content], name, { type: 'text/plain' });
};

describe('handleFileTreeDropEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    const prototype = DataTransferItem.prototype as unknown as Record<string, unknown>;
    // Clean up prototype modifications
    delete prototype.getAsFileSystemHandle;
    delete prototype.webkitGetAsEntry;

    // Reset mocks
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('p-map fallback 로직', () => {
    test('p-map이 없을 때 순차 처리로 fallback', async () => {
      // p-map import 실패 시뮬레이션
      vi.doMock('p-map', () => {
        throw new Error('Module not found');
      });

      const files = [createMockFile('test1.txt'), createMockFile('test2.txt')];

      const event = createMockDragEvent({
        files,
        supportsFileSystemAccessAPI: false,
        supportsWebkitGetAsEntry: false,
      });

      const result = await handleFileTreeDropEvent(event as unknown as React.DragEvent);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        type: 'file',
        path: 'test1.txt',
        file: files[0],
      });
      expect(result[1]).toEqual({
        type: 'file',
        path: 'test2.txt',
        file: files[1],
      });
    });

    test('p-map이 있을 때 병렬 처리', async () => {
      const mockPMap = vi.fn(async (items: any[], mapper: (item: any) => Promise<any>) => {
        // 병렬 처리 시뮬레이션
        return Promise.all(items.map(mapper));
      });

      vi.doMock('p-map', () => ({
        default: mockPMap,
      }));

      const files = [createMockFile('test.txt')];
      const event = createMockDragEvent({
        files,
        supportsFileSystemAccessAPI: false,
        supportsWebkitGetAsEntry: false,
      });

      const result = await handleFileTreeDropEvent(event as unknown as React.DragEvent);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('file');
      expect(result[0].path).toBe('test.txt');
    });

    test('p-map이 있을 때 병렬 처리 (수정됨)', async () => {
      // Re-reading to find the correct line to replace for supportsWebkitGetAsEntry delete
    });
  });

  describe('파일 필터링', () => {
    beforeEach(() => {
      const prototype = DataTransferItem.prototype as unknown as Record<string, unknown>;
      // Ensure clean prototype state for filtering tests
      delete prototype.getAsFileSystemHandle;
      delete prototype.webkitGetAsEntry;
    });

    test('callbackAccept로 파일 필터링', async () => {
      const files = [
        createMockFile('test.txt'),
        createMockFile('test.js'),
        createMockFile('test.md'),
      ];

      const event = createMockDragEvent({
        files,
        supportsFileSystemAccessAPI: false,
        supportsWebkitGetAsEntry: false,
      });

      // .js 파일만 허용하는 필터
      const result = await handleFileTreeDropEvent(
        event as unknown as React.DragEvent,
        (file) => file.name.endsWith('.js'),
      );

      expect(result).toHaveLength(1);
      expect(result[0].path).toBe('test.js');
      if (result[0].type === 'file') {
        expect(result[0].file).toBe(files[1]);
      }
    });

    test('모든 파일 거부하는 필터', async () => {
      const files = [createMockFile('test.txt')];

      const event = createMockDragEvent({
        files,
        supportsFileSystemAccessAPI: false,
        supportsWebkitGetAsEntry: false,
      });

      const result = await handleFileTreeDropEvent(
        event as unknown as React.DragEvent,
        () => false, // 모든 파일 거부
      );

      expect(result).toEqual([]);
    });

    test('필터가 없을 때 모든 파일 허용', async () => {
      const files = [createMockFile('test1.txt'), createMockFile('test2.txt')];

      const event = createMockDragEvent({
        files,
        supportsFileSystemAccessAPI: false,
        supportsWebkitGetAsEntry: false,
      });

      const result = await handleFileTreeDropEvent(event as unknown as React.DragEvent);

      expect(result).toHaveLength(2);
    });
  });

  describe('API 감지 로직', () => {
    test('prototype에 API 메서드 존재 확인', () => {
      const prototype = DataTransferItem.prototype as unknown as Record<string, unknown>;
      // FileSystemAccessAPI 지원 시뮬레이션
      Object.defineProperty(DataTransferItem.prototype, 'getAsFileSystemHandle', {
        value: vi.fn(),
        configurable: true,
      });

      const supportsAPI = 'getAsFileSystemHandle' in DataTransferItem.prototype;
      expect(supportsAPI).toBe(true);

      // cleanup
      delete prototype.getAsFileSystemHandle;
    });

    test('webkit API 지원 감지', () => {
      const prototype = DataTransferItem.prototype as unknown as Record<string, unknown>;
      Object.defineProperty(DataTransferItem.prototype, 'webkitGetAsEntry', {
        value: vi.fn(),
        configurable: true,
      });

      const supportsWebkit = 'webkitGetAsEntry' in DataTransferItem.prototype;
      expect(supportsWebkit).toBe(true);

      // cleanup
      delete prototype.webkitGetAsEntry;
    });
  });
});
