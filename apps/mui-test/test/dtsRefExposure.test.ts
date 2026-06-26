// 빌드 산출 .d.ts의 컴포넌트 ref 타입 노출을 잠그는 테스트 (SC#4).
// apps pretest 훅이 @cp949/mui-react19를 선빌드하므로 dist는 최신이다.
// ref 노출은 두 SHAPE: BoxProps 구조분해 ref(Center)와 명시 ref?:(FileButton/SegmentedControl).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// vitest는 apps/mui-test에서 실행되므로 cwd 기준 2단계 상위가 repo root.
// happy-dom 환경에서 import.meta.url이 file: 스킴이 아니라 new URL()이 실패하므로 cwd 경로를 쓴다.
const dts = readFileSync(resolve(process.cwd(), '../../packages/mui/dist/index.d.ts'), 'utf8');

describe('dist .d.ts ref 노출', () => {
  it('Center 산출 .d.ts에 BoxProps 구조분해 ref가 노출된다', () => {
    // 단순 ref?: grep은 구조분해형 Center를 놓치므로 구조분해 형태로 단언한다.
    expect(dts).toMatch(/ref, \.\.\.props \}: CenterProps/);
  });

  it('FileButton 산출 .d.ts에 명시 ref?: React.Ref<HTMLInputElement>가 노출된다', () => {
    expect(dts).toContain('ref?: React.Ref<HTMLInputElement>');
  });

  it('SegmentedControl 산출 .d.ts에 명시 ref?: Ref<HTMLDivElement>가 노출된다', () => {
    expect(dts).toContain('ref?: Ref<HTMLDivElement>');
  });
});
