import { describe, expect, test } from 'vitest';
import type { FileItem, FileTreeNode } from '../../src/file-drop/types.js';
import {
  buildFileTree,
  createFileItem,
  FilePathUtils,
  filterTree,
  findInTree,
  flattenTree,
  inferMimeType,
  isValidFileName,
  isValidFileSize,
  isValidFileType,
} from '../../src/file-drop/utils/file-utils.js';

const createMockFile = (name: string, size: number = 1024): File => {
  return new File(['x'.repeat(size)], name, { type: 'text/plain' });
};

describe('FilePathUtils', () => {
  describe('normalize', () => {
    test('중복 슬래시 제거', () => {
      expect(FilePathUtils.normalize('a//b///c')).toBe('a/b/c');
    });

    test('후행 슬래시 제거', () => {
      expect(FilePathUtils.normalize('a/b/c/')).toBe('a/b/c');
    });

    test('루트 경로 처리', () => {
      expect(FilePathUtils.normalize('/')).toBe('/');
      expect(FilePathUtils.normalize('')).toBe('/');
    });
  });

  describe('join', () => {
    test('경로 조합', () => {
      expect(FilePathUtils.join('a', 'b', 'c')).toBe('a/b/c');
      expect(FilePathUtils.join('/a', 'b/', '/c')).toBe('/a/b/c');
    });

    test('빈 세그먼트 제거', () => {
      expect(FilePathUtils.join('a', '', 'b')).toBe('a/b');
    });
  });

  describe('dirname', () => {
    test('디렉토리 경로 추출', () => {
      expect(FilePathUtils.dirname('/a/b/c')).toBe('/a/b');
      expect(FilePathUtils.dirname('/a')).toBe('/');
      expect(FilePathUtils.dirname('/')).toBe('/');
    });
  });

  describe('basename', () => {
    test('파일명 추출', () => {
      expect(FilePathUtils.basename('/a/b/file.txt')).toBe('file.txt');
      expect(FilePathUtils.basename('/a/b/file.txt', '.txt')).toBe('file');
    });
  });

  describe('extname', () => {
    test('확장자 추출', () => {
      expect(FilePathUtils.extname('file.txt')).toBe('.txt');
      expect(FilePathUtils.extname('file.tar.gz')).toBe('.gz');
      expect(FilePathUtils.extname('file')).toBe('');
    });
  });

  describe('relative', () => {
    test('상대 경로 계산', () => {
      expect(FilePathUtils.relative('/a/b', '/a/b/c')).toBe('c');
      expect(FilePathUtils.relative('/a/b/c', '/a/b')).toBe('..');
      expect(FilePathUtils.relative('/a/b', '/a/d')).toBe('../d');
    });
  });
});

describe('파일 검증 함수들', () => {
  describe('isValidFileType', () => {
    test('허용된 확장자', () => {
      const file = createMockFile('test.txt');
      expect(isValidFileType(file, ['.txt', '.md'])).toBe(true);
      expect(isValidFileType(file, ['txt', 'md'])).toBe(true); // 점 없이도 허용
    });

    test('허용되지 않은 확장자', () => {
      const file = createMockFile('test.exe');
      expect(isValidFileType(file, ['.txt', '.md'])).toBe(false);
    });

    test('빈 허용 리스트는 모든 파일 허용', () => {
      const file = createMockFile('test.exe');
      expect(isValidFileType(file, [])).toBe(true);
    });
  });

  describe('isValidFileSize', () => {
    test('크기 제한 확인', () => {
      const smallFile = createMockFile('small.txt', 500);
      const largeFile = createMockFile('large.txt', 1500);

      expect(isValidFileSize(smallFile, 1000)).toBe(true);
      expect(isValidFileSize(largeFile, 1000)).toBe(false);
    });
  });

  describe('isValidFileName', () => {
    test('유효한 파일명', () => {
      expect(isValidFileName('test.txt')).toBe(true);
      expect(isValidFileName('my file.txt')).toBe(true);
    });

    test('유효하지 않은 파일명', () => {
      expect(isValidFileName('test<>.txt')).toBe(false);
      expect(isValidFileName('')).toBe(false);
      expect(isValidFileName('   ')).toBe(false);
    });
  });

  describe('inferMimeType', () => {
    test('파일 타입이 있는 경우', () => {
      const file = new File([''], 'test.txt', { type: 'text/custom' });
      expect(inferMimeType(file)).toBe('text/custom');
    });

    test('확장자로부터 추론', () => {
      const jsFile = new File([''], 'script.js', { type: '' }); // 빈 타입으로 설정
      const pngFile = new File([''], 'image.png', { type: '' });

      expect(inferMimeType(jsFile)).toBe('text/javascript');
      expect(inferMimeType(pngFile)).toBe('image/png');
    });

    test('알 수 없는 확장자', () => {
      const unknownFile = new File([''], 'file.unknown', { type: '' });
      expect(inferMimeType(unknownFile)).toBe('application/octet-stream');
    });
  });
});

describe('createFileItem', () => {
  test('파일 아이템 생성', () => {
    const file = new File(['x'.repeat(500)], 'test.js', { type: '' }); // 빈 타입으로 설정
    const item = createFileItem(file, '/folder/test.js');

    expect(item.type).toBe('file');
    expect(item.name).toBe('test.js');
    expect(item.path).toBe('/folder/test.js');
    expect(item.size).toBe(500);
    expect(item.extension).toBe('.js');
    expect(item.mimeType).toBe('text/javascript');
    expect(item.file).toBe(file);
  });
});

describe('트리 구조 함수들', () => {
  const createFileItems = (): FileItem[] => [
    {
      type: 'file',
      name: 'readme.txt',
      path: 'readme.txt',
      pathSegments: ['readme.txt'],
      relativePath: 'readme.txt',
      size: 100,
    },
    {
      type: 'directory',
      name: 'src',
      path: 'src',
      pathSegments: ['src'],
      relativePath: 'src',
    },
    {
      type: 'file',
      name: 'index.js',
      path: 'src/index.js',
      pathSegments: ['src', 'index.js'],
      relativePath: 'src/index.js',
      size: 200,
    },
  ];

  describe('buildFileTree', () => {
    test('파일 트리 빌드', () => {
      const items = createFileItems();
      const tree = buildFileTree(items);

      expect(tree.type).toBe('directory');
      expect(tree.children).toHaveLength(2); // readme.txt, src

      const srcDir = tree.children?.find((c) => c.name === 'src');
      expect(srcDir?.type).toBe('directory');
      expect(srcDir?.children).toHaveLength(1); // index.js
    });
  });

  describe('flattenTree', () => {
    test('트리 평면화', () => {
      const tree: FileTreeNode = {
        name: 'root',
        type: 'directory',
        path: '',
        children: [
          {
            name: 'file1.txt',
            type: 'file',
            path: 'file1.txt',
          },
          {
            name: 'dir1',
            type: 'directory',
            path: 'dir1',
            children: [
              {
                name: 'file2.txt',
                type: 'file',
                path: 'dir1/file2.txt',
              },
            ],
          },
        ],
      };

      const flattened = flattenTree(tree);

      expect(flattened).toHaveLength(4); // root, file1.txt, dir1, file2.txt
      expect(flattened.map((item) => item.name)).toEqual([
        'root',
        'file1.txt',
        'dir1',
        'file2.txt',
      ]);
    });
  });

  describe('filterTree', () => {
    test('트리 필터링', () => {
      const tree: FileTreeNode = {
        name: 'root',
        type: 'directory',
        path: '',
        children: [
          {
            name: 'keep.txt',
            type: 'file',
            path: 'keep.txt',
          },
          {
            name: 'remove.txt',
            type: 'file',
            path: 'remove.txt',
          },
        ],
      };

      const filtered = filterTree(
        tree,
        (node) => node.type === 'directory' || node.name.includes('keep'),
      );

      expect(filtered?.children).toHaveLength(1);
      expect(filtered?.children?.[0].name).toBe('keep.txt');
    });
  });

  describe('findInTree', () => {
    test('트리에서 노드 찾기', () => {
      const tree: FileTreeNode = {
        name: 'root',
        type: 'directory',
        path: '',
        children: [
          {
            name: 'target.txt',
            type: 'file',
            path: 'target.txt',
          },
        ],
      };

      const found = findInTree(tree, (node) => node.name === 'target.txt');

      expect(found).toBeDefined();
      expect(found?.name).toBe('target.txt');
      expect(found?.type).toBe('file');
    });

    test('존재하지 않는 노드', () => {
      const tree: FileTreeNode = {
        name: 'root',
        type: 'directory',
        path: '',
      };

      const found = findInTree(tree, (node) => node.name === 'nonexistent');

      expect(found).toBeNull();
    });
  });
});
