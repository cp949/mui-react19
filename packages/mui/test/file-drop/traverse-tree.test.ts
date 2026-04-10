import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PathHolder } from '../../src/file-drop/internal/path-util.js';
import { traverseTree } from '../../src/file-drop/internal/traverse-tree.js';
import type { PathAndEntry } from '../../src/file-drop/internal/visit-file-system/internal-types.js';

const { visitByFileSystemEntryMock, visitByFileSystemHandleMock } = vi.hoisted(() => {
  return {
    visitByFileSystemEntryMock: vi.fn(),
    visitByFileSystemHandleMock: vi.fn(),
  };
});

vi.mock('../../src/file-drop/internal/visit-file-system/visit-file-system-entry.js', () => ({
  visitByFileSystemEntry: visitByFileSystemEntryMock,
}));

vi.mock('../../src/file-drop/internal/visit-file-system/visit-file-system-handle.js', () => ({
  visitByFileSystemHandle: visitByFileSystemHandleMock,
}));

const createMockFile = (name: string): File => {
  return new File(['test content'], name, { type: 'text/plain' });
};

const createMockFileSystemEntry = (options: {
  name: string;
  isFile: boolean;
  isDirectory: boolean;
}): FileSystemEntry => {
  return {
    filesystem: {} as FileSystem,
    fullPath: `/${options.name}`,
    name: options.name,
    isFile: options.isFile,
    isDirectory: options.isDirectory,
  } as FileSystemEntry;
};

const createMockFileSystemHandle = (options: {
  name: string;
  kind: 'file' | 'directory';
}): FileSystemHandle => {
  return {
    kind: options.kind,
    name: options.name,
    isSameEntry: vi.fn(),
  } as FileSystemHandle;
};

describe('traverseTree', () => {
  beforeEach(() => {
    visitByFileSystemEntryMock.mockReset();
    visitByFileSystemHandleMock.mockReset();
  });

  test('File 객체 처리', async () => {
    const output: PathAndEntry[] = [];
    const parent = PathHolder.from('parent');
    const file = createMockFile('test.txt');
    const callbackAccept = vi.fn().mockReturnValue(true);

    await traverseTree(parent, file, output, callbackAccept);

    expect(callbackAccept).toHaveBeenCalledWith(file);
    expect(output).toHaveLength(1);
    expect(output[0].type).toBe('file');
    if (output[0].type === 'file') {
      expect(output[0].file).toBe(file);
    }
    expect(output[0].path.toString()).toBe('parent/test.txt');
  });

  test('File 객체 처리 - 필터로 거부', async () => {
    const output: PathAndEntry[] = [];
    const parent = PathHolder.EMPTY;
    const file = createMockFile('test.txt');
    const callbackAccept = vi.fn().mockReturnValue(false); // 파일 거부

    await traverseTree(parent, file, output, callbackAccept);

    expect(callbackAccept).toHaveBeenCalledWith(file);
    expect(output).toHaveLength(0); // 거부되어 출력에 추가되지 않음
  });

  test('FileSystemEntry 감지 및 처리', async () => {
    const output: PathAndEntry[] = [];
    const parent = PathHolder.EMPTY;
    const entry = createMockFileSystemEntry({
      name: 'test.txt',
      isFile: true,
      isDirectory: false,
    });
    const callbackAccept = vi.fn();

    await traverseTree(parent, entry, output, callbackAccept);

    expect(visitByFileSystemEntryMock).toHaveBeenCalledWith(
      parent,
      entry,
      output,
      callbackAccept,
      'none',
      true,
      4,
    );
    expect(visitByFileSystemHandleMock).not.toHaveBeenCalled();
  });

  test('FileSystemHandle 감지 및 처리', async () => {
    const output: PathAndEntry[] = [];
    const parent = PathHolder.EMPTY;
    const handle = createMockFileSystemHandle({
      name: 'test.txt',
      kind: 'file',
    });
    const callbackAccept = vi.fn();

    await traverseTree(parent, handle, output, callbackAccept);

    expect(visitByFileSystemHandleMock).toHaveBeenCalledWith(
      parent,
      handle,
      output,
      callbackAccept,
      'none',
      true,
      4,
    );
    expect(visitByFileSystemEntryMock).not.toHaveBeenCalled();
  });

  test('속성 감지 로직 - hasProps 함수', async () => {
    const output: PathAndEntry[] = [];
    const parent = PathHolder.EMPTY;
    const callbackAccept = vi.fn().mockReturnValue(true);

    // File 객체처럼 보이지만 실제로는 File이 아닌 객체
    // 이 객체는 File로 처리되어야 함 (FileSystemEntry나 FileSystemHandle이 아니므로)
    const fakeFile = Object.assign(createMockFile('test.txt'), {
      extraProperty: 'fake',
    });

    await traverseTree(parent, fakeFile as unknown as File, output, callbackAccept);

    // File로 처리되었는지 확인
    expect(callbackAccept).toHaveBeenCalledWith(fakeFile);
    expect(output).toHaveLength(1);
    expect(output[0].type).toBe('file');
  });

  test('빈 parent 경로 처리', async () => {
    const output: PathAndEntry[] = [];
    const parent = PathHolder.EMPTY; // 빈 경로
    const file = createMockFile('root.txt');
    const callbackAccept = vi.fn().mockReturnValue(true);

    await traverseTree(parent, file, output, callbackAccept);

    expect(output[0].path.toString()).toBe('root.txt');
  });

  test('중첩된 경로 처리', async () => {
    const output: PathAndEntry[] = [];
    const parent = PathHolder.from('folder1', 'folder2');
    const file = createMockFile('nested.txt');
    const callbackAccept = vi.fn().mockReturnValue(true);

    await traverseTree(parent, file, output, callbackAccept);

    expect(output[0].path.toString()).toBe('folder1/folder2/nested.txt');
  });
});
