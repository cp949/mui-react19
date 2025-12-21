# @cp949/mui-react19/file-drop

React 애플리케이션에서 파일과 폴더를 드래그앤드롭으로 처리하는 모듈입니다.

## 설치

```bash
pnpm add @cp949/mui-react19
```

## 기본 사용법

### 파일 드롭 처리하기

```tsx
import React from 'react';
import { processFileTreeDrop } from '@cp949/mui-react19/file-drop';

function FileDropZone() {
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const result = await processFileTreeDrop(event);

    console.log(`처리된 파일: ${result.files.length}개`);
    result.files.forEach((file) => {
      console.log(file.name, file.size, file.mimeType);
    });
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{ padding: '40px', border: '2px dashed #ccc' }}
    >
      파일을 여기에 드롭하세요
    </div>
  );
}
```

## 주요 기능

### 1. 폴더 구조 탐색

드롭된 폴더의 모든 하위 파일을 자동으로 탐색합니다.

```tsx
function FolderExplorer() {
  const [files, setFiles] = useState([]);

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();

    const result = await processFileTreeDrop(event);

    // 모든 깊이의 파일 접근 가능
    setFiles(result.files);
  };

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <h3>폴더를 드롭하세요</h3>
      <ul>
        {files.map((file) => (
          <li key={file.path}>
            {file.relativePath} - {file.size} bytes
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 2. 진행 상황 추적

파일 처리 진행률을 실시간으로 표시합니다.

```tsx
function ProgressTracker() {
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();

    await processFileTreeDrop(event, {
      callbacks: {
        onProgress: (prog) => {
          setProgress(prog.percentage);
          setCurrentFile(prog.currentItem?.name || '');
        },
      },
    });
  };

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <div>진행률: {progress}%</div>
      <div>처리 중: {currentFile}</div>
    </div>
  );
}
```

### 3. 파일 필터링

특정 조건에 맞는 파일만 처리합니다.

```tsx
import { processFileTreeDrop, FilterPresets } from '@cp949/mui-react19/file-drop';

function ImageUploader() {
  const [images, setImages] = useState([]);

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();

    const result = await processFileTreeDrop(event, {
      filter: {
        maxSize: 10 * 1024 * 1024, // 10MB 제한
        maxFiles: 50, // 최대 50개
        allowedExtensions: ['.jpg', '.png', '.gif', '.webp'],
        excludeDirectories: false,
      },
    });

    setImages(result.files);
  };

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <p>이미지 파일만 업로드 (최대 50개, 10MB 이하)</p>
      <div className="image-grid">
        {images.map((img) => (
          <img key={img.path} src={URL.createObjectURL(img.file)} alt={img.name} width="100" />
        ))}
      </div>
    </div>
  );
}
```

### 4. 필터 프리셋 사용

자주 사용하는 필터를 미리 정의된 프리셋으로 사용합니다.

```tsx
import { FilterPresets } from '@cp949/mui-react19/file-drop';

// 이미지만 허용
const result = await processFileTreeDrop(event, {
  filter: FilterPresets.imagesOnly(),
});

// 개발 파일만 허용
const result = await processFileTreeDrop(event, {
  filter: FilterPresets.developmentFiles(),
});

// 작은 파일만 허용 (1MB 이하)
const result = await processFileTreeDrop(event, {
  filter: FilterPresets.smallFilesOnly(),
});
```

### 5. 커스텀 필터 함수

복잡한 필터링 로직을 직접 작성합니다.

```tsx
function CustomFilter() {
  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();

    const result = await processFileTreeDrop(event, {
      filter: {
        accept: (item) => {
          // 숨김 파일 제외
          if (item.name.startsWith('.')) return false;

          // node_modules 폴더 제외
          if (item.path.includes('node_modules')) return false;

          // 특정 확장자만 허용
          const ext = item.name.split('.').pop()?.toLowerCase();
          return ['js', 'ts', 'jsx', 'tsx', 'json'].includes(ext || '');
        },
      },
    });

    console.log(`${result.files.length}개 파일 처리됨`);
  };

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      JavaScript/TypeScript 프로젝트 파일만 드롭하세요
    </div>
  );
}
```

### 6. 병렬 처리 성능 최적화

많은 파일을 빠르게 처리합니다.

```tsx
function PerformanceOptimized() {
  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();

    const result = await processFileTreeDrop(event, {
      processing: {
        parallel: true, // 병렬 처리 활성화 (기본값)
        concurrency: 8, // 동시 처리 수 (기본값: 4)
      },
    });

    console.log(`처리 시간: ${result.metadata.processingTime}ms`);
  };

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      대량 파일 업로드
    </div>
  );
}
```

### 7. 에러 처리

파일 처리 중 발생하는 에러를 처리합니다.

```tsx
function ErrorHandling() {
  const [errors, setErrors] = useState([]);

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();

    try {
      const result = await processFileTreeDrop(event, {
        callbacks: {
          onError: (error, item) => {
            console.error(`${item?.name} 처리 실패:`, error.message);
          },
        },
      });

      // 부분적으로 실패한 경우
      if (result.errors.length > 0) {
        setErrors(result.errors);
      }
    } catch (error) {
      console.error('전체 처리 실패:', error);
    }
  };

  return (
    <div>
      <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        파일 드롭 영역
      </div>
      {errors.length > 0 && (
        <div style={{ color: 'red' }}>
          {errors.map((err, idx) => (
            <div key={idx}>
              {err.item?.name}: {err.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 8. 안전한 처리 (Safe API)

예외를 던지지 않고 결과 객체로 반환합니다.

```tsx
import { processFileTreeDropSafe } from '@cp949/mui-react19/file-drop';

function SafeProcessing() {
  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();

    const result = await processFileTreeDropSafe(event);

    if ('error' in result) {
      // 실패한 경우
      console.error('처리 실패:', result.error.message);

      // 부분 결과가 있다면 사용
      if (result.partialResult) {
        console.log('부분 결과:', result.partialResult.files.length);
      }
    } else {
      // 성공한 경우
      console.log('성공:', result.files.length);
    }
  };

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      안전한 파일 처리
    </div>
  );
}
```

### 9. 처리 중단

긴 작업을 중간에 취소합니다.

```tsx
function Cancellable() {
  const [controller, setController] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();

    const abortController = new AbortController();
    setController(abortController);
    setProcessing(true);

    try {
      await processFileTreeDrop(event, {
        signal: abortController.signal,
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('처리가 취소되었습니다');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    controller?.abort();
  };

  return (
    <div>
      <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        파일 드롭 영역
      </div>
      {processing && <button onClick={handleCancel}>처리 중단</button>}
    </div>
  );
}
```

### 10. 트리 구조 활용

폴더 계층 구조를 트리 형태로 사용합니다.

```tsx
import { processFileTreeDrop, flattenTree, filterTree } from '@cp949/mui-react19/file-drop';

function TreeStructure() {
  const [tree, setTree] = useState(null);

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();

    const result = await processFileTreeDrop(event);

    // 계층 구조 저장
    setTree(result.tree);

    // 트리에서 특정 파일 찾기
    const jsFiles = filterTree(
      result.tree,
      (node) => node.type === 'file' && node.name.endsWith('.js'),
    );

    // 트리 평면화
    const allNodes = flattenTree(result.tree);

    console.log('트리 구조:', result.tree);
    console.log('JS 파일들:', jsFiles);
  };

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      폴더 구조 분석
    </div>
  );
}
```

### 11. 재사용 가능한 커스텀 훅

파일 드롭 로직을 훅으로 추상화합니다.

```tsx
import { useState, useCallback } from 'react';
import { processFileTreeDrop } from '@cp949/mui-react19/file-drop';

function useFileDrop(options = {}) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleDrop = useCallback(
    async (event) => {
      event.preventDefault();
      setLoading(true);
      setError(null);
      setProgress(0);

      try {
        const result = await processFileTreeDrop(event, {
          ...options,
          callbacks: {
            ...options.callbacks,
            onProgress: (prog) => {
              setProgress(prog.percentage);
              options.callbacks?.onProgress?.(prog);
            },
          },
        });

        setFiles(result.files);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options],
  );

  const reset = useCallback(() => {
    setFiles([]);
    setProgress(0);
    setError(null);
  }, []);

  return {
    files,
    loading,
    progress,
    error,
    handleDrop,
    reset,
    dropProps: {
      onDrop: handleDrop,
      onDragOver: (e) => e.preventDefault(),
    },
  };
}

// 사용 예시
function MyUploader() {
  const { files, loading, progress, dropProps } = useFileDrop({
    filter: {
      maxSize: 10 * 1024 * 1024,
      allowedExtensions: ['.pdf', '.doc', '.docx'],
    },
  });

  return (
    <div {...dropProps} style={{ padding: '20px', border: '2px dashed #ccc' }}>
      {loading && <div>업로드 중... {progress}%</div>}
      <p>문서를 드롭하세요</p>
      <ul>
        {files.map((file) => (
          <li key={file.path}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 실전 예제

### 이미지 갤러리

```tsx
import React, { useState } from 'react';
import { processFileTreeDrop, FilterPresets } from '@cp949/mui-react19/file-drop';

function ImageGallery() {
  const [images, setImages] = useState([]);
  const [progress, setProgress] = useState(0);

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();

    const result = await processFileTreeDrop(event, {
      filter: {
        ...FilterPresets.imagesOnly(),
        maxSize: 5 * 1024 * 1024,
      },
      callbacks: {
        onProgress: (prog) => setProgress(prog.percentage),
      },
    });

    setImages(
      result.files.map((file) => ({
        name: file.name,
        path: file.relativePath,
        url: URL.createObjectURL(file.file),
        size: file.size,
      })),
    );
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          padding: '40px',
          border: '2px dashed #ccc',
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        {progress > 0 ? (
          <div>이미지 처리 중... {progress}%</div>
        ) : (
          <div>이미지를 드롭하세요 (최대 5MB)</div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {images.map((img, idx) => (
          <div key={idx} style={{ textAlign: 'center' }}>
            <img
              src={img.url}
              alt={img.name}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
            <div style={{ fontSize: '12px', marginTop: '8px' }}>
              <div>{img.name}</div>
              <div>{Math.round(img.size / 1024)}KB</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 프로젝트 파일 분석기

```tsx
import React, { useState } from 'react';
import { processFileTreeDrop, FilterPresets } from '@cp949/mui-react19/file-drop';

function ProjectAnalyzer() {
  const [stats, setStats] = useState(null);

  const analyzeProject = async (event: React.DragEvent) => {
    event.preventDefault();

    const result = await processFileTreeDrop(event, {
      filter: FilterPresets.developmentFiles(),
    });

    // 확장자별 통계
    const filesByExt = result.files.reduce((acc, file) => {
      const ext = file.extension || 'other';
      acc[ext] = (acc[ext] || 0) + 1;
      return acc;
    }, {});

    // 큰 파일 찾기
    const largeFiles = result.files
      .filter((f) => f.size > 100 * 1024)
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    setStats({
      totalFiles: result.files.length,
      totalSize: result.metadata.totalSize,
      filesByExt,
      largeFiles,
    });
  };

  return (
    <div>
      <div
        onDrop={analyzeProject}
        onDragOver={(e) => e.preventDefault()}
        style={{ padding: '40px', border: '2px dashed #ccc', marginBottom: '20px' }}
      >
        프로젝트 폴더를 드롭하세요
      </div>

      {stats && (
        <div>
          <h3>분석 결과</h3>
          <p>
            총 {stats.totalFiles}개 파일, {Math.round(stats.totalSize / 1024)}KB
          </p>

          <h4>파일 유형</h4>
          <ul>
            {Object.entries(stats.filesByExt).map(([ext, count]) => (
              <li key={ext}>
                {ext}: {count}개
              </li>
            ))}
          </ul>

          <h4>큰 파일들</h4>
          <ul>
            {stats.largeFiles.map((file) => (
              <li key={file.path}>
                {file.name}: {Math.round(file.size / 1024)}KB
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### 폴더 구조 시각화

```tsx
import React, { useState } from 'react';
import { processFileTreeDrop } from '@cp949/mui-react19/file-drop';

function TreeNode({ node, level = 0 }) {
  const indent = { marginLeft: `${level * 20}px` };

  return (
    <div>
      <div style={indent}>
        {node.type === 'directory' ? '[DIR]' : '[FILE]'} {node.name}
        {node.metadata && (
          <span style={{ color: '#666', fontSize: '0.9em' }}>
            {' '}
            ({Math.round(node.metadata.size / 1024)}KB)
          </span>
        )}
      </div>
      {node.children?.map((child, idx) => (
        <TreeNode key={idx} node={child} level={level + 1} />
      ))}
    </div>
  );
}

function FolderTreeViewer() {
  const [tree, setTree] = useState(null);

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();

    const result = await processFileTreeDrop(event);
    setTree(result.tree);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ padding: '40px', border: '2px dashed #ccc', marginBottom: '20px' }}
      >
        폴더를 드롭하여 구조를 확인하세요
      </div>

      {tree && (
        <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
          <TreeNode node={tree} />
        </div>
      )}
    </div>
  );
}
```

## API 참조

### processFileTreeDrop

```typescript
function processFileTreeDrop(
  source: FileDropSource,
  options?: FileDropOptions,
): Promise<ProcessResult>;
```

#### FileDropSource

- `React.DragEvent<HTMLElement>` - React 드래그 이벤트
- `FileList` - 파일 입력 요소의 files
- `FileSystemHandle[]` - File System Access API 핸들
- `File[]` - File 객체 배열

#### FileDropOptions

```typescript
interface FileDropOptions {
  filter?: {
    accept?: (item: FileItem) => boolean;
    maxSize?: number;
    maxFiles?: number;
    allowedExtensions?: string[];
    excludeDirectories?: boolean;
  };
  processing?: {
    parallel?: boolean;
    concurrency?: number;
    preserveStructure?: boolean;
  };
  callbacks?: {
    onProgress?: (progress: ProgressInfo) => void;
    onError?: (error: FileDropError, item?: FileItem) => void;
    onFile?: (file: ProcessedFile) => void;
  };
  includeMetadata?: boolean;
  signal?: AbortSignal;
  debug?: 'none' | 'info' | 'verbose' | boolean;
}
```

#### ProcessResult

```typescript
interface ProcessResult {
  files: ProcessedFile[];
  directories: ProcessedDirectory[];
  tree: FileTreeNode;
  metadata: {
    totalFiles: number;
    totalDirectories: number;
    totalSize: number;
    processingTime: number;
  };
  errors: FileDropError[];
}
```

### processFileTreeDropSafe

예외를 던지지 않는 안전한 버전입니다.

```typescript
function processFileTreeDropSafe(
  source: FileDropSource,
  options?: FileDropOptions,
): Promise<ProcessResult | ErrorResult>;
```

### 유틸리티 함수

```typescript
// 트리 평면화
function flattenTree(tree: FileTreeNode): FileTreeNode[];

// 트리 필터링
function filterTree(tree: FileTreeNode, predicate: (node: FileTreeNode) => boolean): FileTreeNode[];

// 트리에서 찾기
function findInTree(
  tree: FileTreeNode,
  predicate: (node: FileTreeNode) => boolean,
): FileTreeNode | null;

// 파일 트리 생성
function buildFileTree(files: ProcessedFile[]): FileTreeNode;
```

### FilterPresets

```typescript
class FilterPresets {
  static imagesOnly(): FilterOptions;
  static developmentFiles(): FilterOptions;
  static smallFilesOnly(maxSize?: number): FilterOptions;
  static documentsOnly(): FilterOptions;
}
```

## 브라우저 지원

- Chrome 86+
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge 86+

File System Access API는 HTTPS 환경에서만 동작합니다. 지원하지 않는 브라우저는 자동으로 webkit API를 사용합니다.

## TypeScript 지원

완전한 타입 정의가 포함되어 있습니다.

```typescript
import type {
  FileItem,
  ProcessedFile,
  ProcessResult,
  FileDropOptions,
  ProgressInfo,
} from '@cp949/mui-react19/file-drop';
```

## 성능

내장 병렬 처리 엔진으로 빠른 성능을 제공합니다:

- 병렬 처리: 기본 동시 실행 수 4개
- 메모리 효율적: 동시 처리 수 제한으로 메모리 관리
- 대용량 파일: 1000개 파일 기준 약 2-3초 처리

## 주의사항

- `URL.createObjectURL()`로 생성한 URL은 사용 후 `URL.revokeObjectURL()`로 해제해야 합니다
- 대용량 파일 처리 시 메모리 사용량에 주의하세요
- HTTPS 환경에서 사용을 권장합니다

## 라이선스

MIT
