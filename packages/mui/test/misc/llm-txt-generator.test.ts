import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { extractEntryApis, renderLlmTxt } from '../../scripts/llm-txt-generator.mjs';

const FIXTURE_DTS = `
declare namespace JSX { interface Element {} }

/** 주석은 결과에서 제거되어야 한다. */
interface BoxLikeProps {
  /** 가로 길이 */
  width?: number;
  hidden?: boolean;
}

interface CenterProps extends BoxLikeProps {
  vertical?: boolean;
}

type Mode = 'a' | 'b';

declare const Center: ({ vertical, ...props }: CenterProps) => JSX.Element;

declare const FlexRowStart: (props: CenterProps) => JSX.Element;
declare const FlexRow: {
  (props: CenterProps): JSX.Element;
  Start: typeof FlexRowStart;
  displayName: string;
};

declare const isBrowser: boolean;

declare function useThing<T>(value: T, mode?: Mode): [T, () => void];

declare class Holder {
  private secret;
  readonly name: string;
  static create(name: string): Holder;
}

declare function paint(color: string): string;
declare namespace cssVars { export { paint }; }

export { Center, type CenterProps, FlexRow, Holder, type Mode, cssVars, isBrowser, useThing };
`;

describe('extractEntryApis', () => {
  let tempDir: string;
  let result: ReturnType<typeof extractEntryApis>;

  beforeAll(() => {
    tempDir = mkdtempSync(path.join(tmpdir(), 'llm-txt-'));
    const entryPath = path.join(tempDir, 'index.d.ts');
    writeFileSync(entryPath, FIXTURE_DTS);
    result = extractEntryApis(entryPath);
  });

  afterAll(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  test('구조 분해된 매개변수를 props로 치환한 컴포넌트 시그니처를 만든다', () => {
    expect(result.values).toContain('Center(props: CenterProps): JSX.Element');
  });

  test('제네릭 함수 시그니처를 보존한다', () => {
    expect(result.values).toContain(
      'useThing<T>(value: T, mode?: Mode | undefined): [T, () => void]',
    );
  });

  test('복합 컴포넌트의 정적 멤버를 Name.Member 형태로 펼치고 displayName은 제외한다', () => {
    expect(result.values).toContain('FlexRow(props: CenterProps): JSX.Element');
    expect(result.values).toContain('FlexRow.Start(props: CenterProps): JSX.Element');
    expect(result.values.some((text) => text.includes('displayName'))).toBe(false);
  });

  test('원시 타입 상수는 내장 메서드 없이 타입만 표기한다', () => {
    expect(result.values).toContain('isBrowser: boolean');
    expect(result.values.some((text) => text.includes('valueOf'))).toBe(false);
  });

  test('네임스페이스로 노출된 export는 cssVars.paint 형태로 펼친다', () => {
    expect(result.values).toContain('cssVars.paint(color: string): string');
  });

  test('클래스 선언에서 private 멤버를 제거한다', () => {
    const holder = result.values.find((text) => text.startsWith('class Holder'));
    expect(holder).toBeDefined();
    expect(holder).not.toContain('secret');
    expect(holder).toContain('static create(name: string): Holder');
  });

  test('interface는 자신이 선언한 멤버만 남기고 주석을 제거한다', () => {
    expect(result.types).toContain(
      'interface CenterProps extends BoxLikeProps { vertical?: boolean; }',
    );
    expect(result.types.some((text) => text.includes('/**'))).toBe(false);
  });

  test('type alias를 types에 포함한다', () => {
    expect(result.types).toContain("type Mode = 'a' | 'b'");
  });

  test('존재하지 않는 진입점 파일이면 예외를 던진다', () => {
    expect(() => extractEntryApis(path.join(tempDir, 'missing.d.ts'))).toThrow();
  });
});

describe('renderLlmTxt', () => {
  const output = renderLlmTxt({
    packageName: '@scope/pkg',
    entries: [
      { specifier: '@scope/pkg', values: ['Center(props: CenterProps): JSX.Element'], types: [] },
      { specifier: '@scope/pkg/hooks', values: [], types: ['type Mode = "a"'] },
    ],
  });

  test('필수 섹션을 모두 포함한다', () => {
    for (const heading of [
      '# Library: @scope/pkg',
      '## Overview',
      '## Key APIs',
      '## Usage Patterns',
      '## Constraints',
      '## Anti-Patterns',
    ]) {
      expect(output).toContain(heading);
    }
  });

  test('진입점별 시그니처를 해당 진입점 아래에 출력한다', () => {
    expect(output).toContain('### `@scope/pkg`');
    expect(output).toContain('- `Center(props: CenterProps): JSX.Element`');
    expect(output).toContain('### `@scope/pkg/hooks`');
    expect(output).toContain('- `type Mode = "a"`');
  });

  test('줄바꿈으로 끝난다', () => {
    expect(output.endsWith('\n')).toBe(true);
  });
});
