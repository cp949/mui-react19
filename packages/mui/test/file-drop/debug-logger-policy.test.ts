import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

const runtimeFiles = [
  'src/file-drop/process-file-drop.ts',
  'src/file-drop/internal/visit-file-system/visit-file-system-entry.ts',
  'src/file-drop/internal/visit-file-system/visit-file-system-handle.ts',
];

describe('file-drop debug logger policy', () => {
  test('런타임 경로에서 console을 직접 호출하지 않음', () => {
    const directConsoleCalls = runtimeFiles.flatMap((filePath) => {
      const source = readFileSync(filePath, 'utf8');

      return source
        .split('\n')
        .map((line, index) => ({ filePath, line, lineNumber: index + 1 }))
        .filter(({ line }) => {
          const trimmed = line.trim();

          // JSDoc 예제는 허용하고 실제 런타임 console 호출만 금지한다.
          return !trimmed.startsWith('*') && /console\.(log|debug|warn|error)\(/.test(line);
        });
    });

    expect(directConsoleCalls).toEqual([]);
  });
});
