import { describe, expect, test } from 'vitest';
import { PathHolder, PathUtils } from '../../src/file-drop/internal/path-util.js';

describe('PathUtils', () => {
  describe('split', () => {
    test('기본적인 경로 분리', () => {
      expect(PathUtils.split('a/b/c')).toEqual(['a', 'b', 'c']);
      expect(PathUtils.split('/a/b/c')).toEqual(['a', 'b', 'c']);
      expect(PathUtils.split('/a/b/c/')).toEqual(['a', 'b', 'c']);
    });

    test('빈 문자열과 null/undefined 처리', () => {
      expect(PathUtils.split('')).toEqual([]);
      expect(PathUtils.split(null)).toEqual([]);
      expect(PathUtils.split(undefined)).toEqual([]);
    });

    test('점(.)과 연속 슬래시 처리', () => {
      expect(PathUtils.split('./a/./b')).toEqual(['a', 'b']);
      expect(PathUtils.split('a//b///c')).toEqual(['a', 'b', 'c']);
    });

    test('배열과 혼합 인수 처리', () => {
      expect(PathUtils.split(['a', 'b'], 'c/d', ['e'])).toEqual(['a', 'b', 'c', 'd', 'e']);
    });
  });

  describe('join', () => {
    test('기본적인 경로 조합', () => {
      expect(PathUtils.join('a', 'b', 'c')).toBe('a/b/c');
      expect(PathUtils.join(['a', 'b'], 'c')).toBe('a/b/c');
    });

    test('빈 문자열 처리', () => {
      expect(PathUtils.join('', 'a', '', 'b')).toBe('a/b');
    });
  });

  describe('pathStartsWith', () => {
    test('기본적인 startsWith 검사', () => {
      expect(PathUtils.pathStartsWith('a/b/c', 'a/b')).toBe(true);
      expect(PathUtils.pathStartsWith('/a/b/c', 'a/b')).toBe(true);
      expect(PathUtils.pathStartsWith('/a/b/c', '/a/b')).toBe(true);
      expect(PathUtils.pathStartsWith('/a/b/c/', '/a/b/')).toBe(true);
    });

    test('복잡한 경로 처리', () => {
      expect(PathUtils.pathStartsWith('/a//b//c//', '//a//b//')).toBe(true);
      expect(PathUtils.pathStartsWith('a/b/c', 'a/b/c/d')).toBe(false);
      expect(PathUtils.pathStartsWith('a/b', 'a/b/c')).toBe(false);
    });
  });

  describe('segmentsStartsWith', () => {
    test('세그먼트 배열 startsWith 검사', () => {
      expect(PathUtils.segmentsStartsWith(['a', 'b', 'c'], ['a', 'b'])).toBe(true);
      expect(PathUtils.segmentsStartsWith(['a', 'b'], ['a', 'b', 'c'])).toBe(false);
      expect(PathUtils.segmentsStartsWith(['a', 'b', 'c'], [])).toBe(true);
    });
  });
});

describe('PathHolder', () => {
  describe('생성자', () => {
    test('문자열로 생성', () => {
      const path = new PathHolder('a/b/c');
      expect(path.segments).toEqual(['a', 'b', 'c']);
      expect(path.path).toBe('a/b/c');
    });

    test('배열로 생성', () => {
      const path = new PathHolder(['a', 'b', 'c']);
      expect(path.segments).toEqual(['a', 'b', 'c']);
      expect(path.path).toBe('a/b/c');
    });

    test('EMPTY 상수', () => {
      expect(PathHolder.EMPTY.segments).toEqual([]);
      expect(PathHolder.EMPTY.path).toBe('');
    });
  });

  describe('from 정적 메서드', () => {
    test('여러 인수로 생성', () => {
      const path = PathHolder.from('a', 'b/c', ['d']);
      expect(path.segments).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('join', () => {
    test('경로 조합', () => {
      const path = new PathHolder('a/b');
      const newPath = path.join('c', 'd');
      expect(newPath.segments).toEqual(['a', 'b', 'c', 'd']);
      expect(newPath.toString()).toBe('a/b/c/d');
    });
  });

  describe('changeLast', () => {
    test('마지막 세그먼트 변경', () => {
      const path = new PathHolder('a/b/c');
      const newPath = path.changeLast('x');
      expect(newPath.segments).toEqual(['a', 'b', 'x']);
    });

    test('빈 경로에서 changeLast', () => {
      const path = new PathHolder([]);
      const newPath = path.changeLast('x');
      expect(newPath.segments).toEqual(['x']);
    });
  });

  describe('parentOrNull', () => {
    test('부모 경로 반환', () => {
      const path = new PathHolder('a/b/c');
      const parent = path.parentOrNull();
      expect(parent?.segments).toEqual(['a', 'b']);
    });

    test('루트에서 parentOrNull', () => {
      const path = new PathHolder([]);
      expect(path.parentOrNull()).toBeNull();
    });
  });

  describe('lastSegmentOrNull', () => {
    test('마지막 세그먼트 반환', () => {
      const path = new PathHolder('a/b/c');
      expect(path.lastSegmentOrNull()).toBe('c');
    });

    test('빈 경로에서 lastSegmentOrNull', () => {
      const path = new PathHolder([]);
      expect(path.lastSegmentOrNull()).toBeNull();
    });
  });

  describe('lastSegment', () => {
    test('마지막 세그먼트 반환', () => {
      const path = new PathHolder('a/b/c');
      expect(path.lastSegment()).toBe('c');
    });

    test('빈 경로에서 lastSegment', () => {
      const path = new PathHolder([]);
      expect(path.lastSegment()).toBe('');
    });
  });

  describe('startsWith', () => {
    test('문자열과 비교', () => {
      const path = new PathHolder('a/b/c');
      expect(path.startsWith('a/b')).toBe(true);
      expect(path.startsWith('a/x')).toBe(false);
    });

    test('배열과 비교', () => {
      const path = new PathHolder('a/b/c');
      expect(path.startsWith(['a', 'b'])).toBe(true);
      expect(path.startsWith(['a', 'x'])).toBe(false);
    });

    test('PathHolder와 비교', () => {
      const path = new PathHolder('a/b/c');
      const other = new PathHolder('a/b');
      expect(path.startsWith(other)).toBe(true);
    });
  });

  describe('toString', () => {
    test('문자열 변환', () => {
      const path = new PathHolder(['a', 'b', 'c']);
      expect(path.toString()).toBe('a/b/c');
    });
  });
});
