import type { FileItem, FileTreeNode, ProcessedFile } from '../types.js';

/**
 * 파일 경로 유틸리티 (기존 PathUtils 개선)
 */
export class FilePathUtils {
  static normalize(path: string): string {
    return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }

  static join(...segments: string[]): string {
    return FilePathUtils.normalize(segments.filter(Boolean).join('/'));
  }

  static dirname(path: string): string {
    const normalized = FilePathUtils.normalize(path);
    const lastSlash = normalized.lastIndexOf('/');
    return lastSlash <= 0 ? '/' : normalized.slice(0, lastSlash);
  }

  static basename(path: string, ext?: string): string {
    const normalized = FilePathUtils.normalize(path);
    const name = normalized.split('/').pop() || '';
    if (ext && name.endsWith(ext)) {
      return name.slice(0, -ext.length);
    }
    return name;
  }

  static extname(path: string): string {
    const name = FilePathUtils.basename(path);
    const lastDot = name.lastIndexOf('.');
    return lastDot > 0 ? name.slice(lastDot) : '';
  }

  static relative(from: string, to: string): string {
    const fromParts = FilePathUtils.normalize(from).split('/').filter(Boolean);
    const toParts = FilePathUtils.normalize(to).split('/').filter(Boolean);

    let i = 0;
    while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
      i++;
    }

    const upLevels = fromParts.length - i;
    const remainingParts = toParts.slice(i);

    return [...Array(upLevels).fill('..'), ...remainingParts].join('/') || '.';
  }
}

/**
 * 파일 검증 함수들
 */
export function isValidFileType(file: File, allowedExtensions: string[]): boolean {
  if (allowedExtensions.length === 0) return true;

  const extension = FilePathUtils.extname(file.name).toLowerCase();
  return allowedExtensions.some(
    (ext) => ext.toLowerCase() === extension || ext.toLowerCase() === extension.slice(1), // '.' 없이도 허용
  );
}

export function isValidFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

export function isValidFileName(name: string): boolean {
  // 기본적인 파일명 검증 (특수문자 제한)
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(name)) return false;
  for (let i = 0; i < name.length; i += 1) {
    const code = name.charCodeAt(i);
    if (code >= 0x00 && code <= 0x1f) return false;
  }
  return name.trim().length > 0;
}

/**
 * MIME 타입 추론
 */
export function inferMimeType(file: File): string {
  if (file.type) return file.type;

  const extension = FilePathUtils.extname(file.name).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.txt': 'text/plain',
    '.js': 'text/javascript',
    '.ts': 'text/typescript',
    '.json': 'application/json',
    '.html': 'text/html',
    '.css': 'text/css',
    '.md': 'text/markdown',
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };

  return mimeMap[extension] || 'application/octet-stream';
}

/**
 * 파일 아이템 생성
 */
export function createFileItem(
  file: File,
  path: string,
  relativePath: string = path,
): ProcessedFile {
  const extension = FilePathUtils.extname(file.name);
  const mimeType = inferMimeType(file);

  return {
    type: 'file',
    name: file.name,
    path: FilePathUtils.normalize(path),
    pathSegments: path.split('/').filter(Boolean),
    relativePath: FilePathUtils.normalize(relativePath),
    size: file.size,
    lastModified: new Date(file.lastModified),
    file,
    mimeType,
    extension,
  };
}

/**
 * 트리 구조 조작 유틸리티
 */
export function flattenTree(tree: FileTreeNode): FileItem[] {
  const result: FileItem[] = [];

  function traverse(node: FileTreeNode) {
    const item: FileItem = {
      type: node.type,
      name: node.name,
      path: node.path,
      pathSegments: node.path.split('/').filter(Boolean),
      relativePath: node.path,
      size: node.metadata?.size,
      lastModified: node.metadata?.lastModified,
    };

    result.push(item);

    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  traverse(tree);
  return result;
}

export function filterTree(
  tree: FileTreeNode,
  predicate: (node: FileTreeNode) => boolean,
): FileTreeNode | null {
  if (!predicate(tree)) {
    return null;
  }

  const filteredChildren = tree.children
    ?.map((child) => filterTree(child, predicate))
    .filter((child): child is FileTreeNode => child !== null);

  return {
    ...tree,
    children: filteredChildren,
  };
}

export function findInTree(
  tree: FileTreeNode,
  predicate: (node: FileTreeNode) => boolean,
): FileTreeNode | null {
  if (predicate(tree)) {
    return tree;
  }

  if (tree.children) {
    for (const child of tree.children) {
      const found = findInTree(child, predicate);
      if (found) return found;
    }
  }

  return null;
}

/**
 * 트리 빌더
 */
export function buildFileTree(items: FileItem[]): FileTreeNode {
  const root: FileTreeNode = {
    name: '',
    type: 'directory',
    path: '',
    children: [],
  };

  const nodeMap = new Map<string, FileTreeNode>();
  nodeMap.set('', root);

  // 경로 깊이 순으로 정렬
  const sortedItems = [...items].sort((a, b) => a.pathSegments.length - b.pathSegments.length);

  for (const item of sortedItems) {
    const node: FileTreeNode = {
      name: item.name,
      type: item.type,
      path: item.path,
      metadata:
        item.size !== undefined
          ? {
              size: item.size,
              lastModified: item.lastModified!,
              extension: FilePathUtils.extname(item.name),
              mimeType: (item as ProcessedFile).mimeType,
            }
          : undefined,
      file: (item as ProcessedFile).file,
    };

    nodeMap.set(item.path, node);

    // 부모 찾기
    const parentPath = FilePathUtils.dirname(item.path);
    let parent = nodeMap.get(parentPath);

    // 부모가 없으면 생성 (중간 디렉토리 처리)
    if (!parent && parentPath !== '/' && parentPath !== '') {
      const parentSegments = parentPath.split('/').filter(Boolean);
      parent = {
        name: parentSegments[parentSegments.length - 1] || '',
        type: 'directory' as const,
        path: parentPath,
        children: [],
      };
      nodeMap.set(parentPath, parent);
    }

    // 루트에 추가 (parentPath가 '' 또는 '/'인 경우)
    if (!parent && (parentPath === '' || parentPath === '/')) {
      parent = root;
    }

    if (parent) {
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    }
  }

  return root;
}
