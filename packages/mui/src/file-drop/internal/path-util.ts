function split_(...args: (string | undefined | null)[]): string[] {
  return args
    .filter((it) => it && it.length > 0 && it !== '.')
    .flatMap((it) => it!.split('/'))
    .filter((it) => it.length > 0 && it !== '.');
}

/**
 * Path utils
 * not support relative path
 */
export class PathUtils {
  static join(...args: (string[] | string | undefined | null)[]): string {
    return PathUtils.split(...args).join('/');
  }

  static split = (...args: (string[] | string | undefined | null)[]): string[] => {
    const arr = [] as string[];
    args.forEach((item) => {
      if (Array.isArray(item)) {
        item.forEach((it) => {
          if (typeof it === 'string' && it.length > 0) {
            arr.push(...split_(it));
          }
        });
      } else if (typeof item === 'string' && item.length > 0) {
        arr.push(...split_(item));
      }
    });

    return arr.filter((it) => typeof it === 'string' && it.length > 0 && it !== '.');
  };

  /**
   * check startsWith for path segments
   * pathStartsWith('a/b/c','a/b') = true
   * pathStartsWith('/a/b/c','a/b') = true
   * pathStartsWith('/a/b/c','/a/b') = true
   * pathStartsWith('/a/b/c','/a/b/') = true
   * pathStartsWith('/a//b//c//','//a//b//') = true
   */
  static pathStartsWith(p1: string, p2: string): boolean {
    return PathUtils.segmentsStartsWith(PathUtils.split(p1), PathUtils.split(p2));
  }

  /**
   * check startsWith for path segments
   * segmentsStartsWith([1,2,3], [1,2]) = true
   */
  static segmentsStartsWith(p1: string[], p2: string[]): boolean {
    const arr1 = p1;
    const arr2 = p2;
    if (arr2.length > arr1.length) return false;
    return arr2.every((nm, i) => nm === arr1[i]);
  }
}

export class PathHolder {
  readonly segments: string[];

  readonly path: string;

  constructor(path: string | string[]) {
    if (Array.isArray(path)) {
      this.segments = path;
    } else {
      this.segments = PathUtils.split(path);
    }
    this.path = this.segments.join('/');
  }

  static EMPTY = new PathHolder([]);

  static from = (...args: (string[] | string | undefined | null)[]): PathHolder => {
    return new PathHolder(PathUtils.split(...args));
  };

  join = (...args: (string[] | string | undefined | null)[]): PathHolder => {
    const segments = PathUtils.split(...this.segments, ...args);
    return new PathHolder(segments);
  };

  changeLast = (fileName: string): PathHolder => {
    if (this.segments.length === 0) {
      return new PathHolder(fileName);
    }
    const segments = this.segments.slice();
    segments[segments.length - 1] = fileName;
    return new PathHolder(segments);
  };

  parentOrNull = (): PathHolder | null => {
    if (this.segments.length === 0) {
      return null;
    }
    const segments = this.segments.slice(0, this.segments.length - 1);
    return new PathHolder(segments);
  };

  lastSegmentOrNull = (): string | null => {
    if (this.segments.length === 0) {
      return null;
    }
    return this.segments[this.segments.length - 1]!;
  };

  lastSegment = (): string => {
    if (this.segments.length === 0) {
      return '';
    }
    return this.segments[this.segments.length - 1]!;
  };

  startsWith = (otherPath: string | string[] | PathHolder): boolean => {
    if (typeof otherPath === 'string') {
      return PathUtils.segmentsStartsWith(this.segments, PathUtils.split(otherPath));
    } else if (Array.isArray(otherPath)) {
      return PathUtils.segmentsStartsWith(this.segments, otherPath);
    }
    return PathUtils.segmentsStartsWith(this.segments, otherPath.segments);
  };

  toString() {
    return this.path;
  }
}
