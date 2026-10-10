import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const srcDir = join(__dirname, '../../src');

// 서버에서 호출할 수 있는 훅이라 지시어를 붙이지 않는 파일
const SERVER_SAFE_FILES = new Set(['hooks/useId.ts']);

const collectSources = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return collectSources(path);
    const isSource = /\.tsx?$/.test(name) && !/\.(test|spec|stories)\.tsx?$/.test(name);
    return isSource && !name.endsWith('.d.ts') ? [path] : [];
  });

// 주석을 제거해 설명문 속 use* 문자열이 오탐되지 않게 한다
const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const hasClientDirective = (source: string) => /^\s*['"]use client['"]/.test(stripComments(source));

const usesClientOnlyApi = (source: string) => {
  const code = stripComments(source);
  const hooks = [...code.matchAll(/\b(use[A-Z]\w*)\s*[<(]/g)].map((m) => m[1]);
  const hasHook = hooks.some((name) => name !== 'useId');
  return hasHook || /\b(createContext|forwardRef|memo|startTransition)\b\s*[(<]/.test(code);
};

describe("'use client' 지시어", () => {
  it('훅이나 React 클라이언트 API를 쓰는 소스 파일은 지시어를 가진다', () => {
    const missing = collectSources(srcDir)
      .map((path) => ({ rel: relative(srcDir, path), source: readFileSync(path, 'utf8') }))
      .filter(({ rel }) => !SERVER_SAFE_FILES.has(rel))
      .filter(({ source }) => usesClientOnlyApi(source) && !hasClientDirective(source))
      .map(({ rel }) => rel);

    expect(missing).toEqual([]);
  });

  it('Portlet 계열은 MUI에 함수형 prop을 넘기므로 모두 지시어를 가진다', () => {
    const dir = join(srcDir, 'components/portlet');
    const files = readdirSync(dir).filter((name) => /^Portlet\w*\.tsx$/.test(name));

    expect(files.length).toBeGreaterThan(0);
    for (const name of files) {
      expect(hasClientDirective(readFileSync(join(dir, name), 'utf8')), name).toBe(true);
    }
  });
});
