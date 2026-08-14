import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createDomHarness } from '../../test-utils/dom-harness.js';
import { FlexColumn } from './FlexColumn.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('FlexColumn 패밀리 (characterization)', () => {
  const { mount, renderInto, cleanup } = createDomHarness();

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('FlexColumn (main)', () => {
    it('기본값: display flex, flexDirection column, alignItems/justifyContent/flexWrap 미지정(빈 값)', async () => {
      const el = await renderInto((ref) => <FlexColumn ref={ref}>x</FlexColumn>);
      const style = getComputedStyle(el);
      expect(style.display).toBe('flex');
      expect(style.flexDirection).toBe('column');
      expect(style.alignItems).toBe('');
      expect(style.justifyContent).toBe('');
      expect(style.flexWrap).toBe('');
    });

    it('inlineFlex=true면 display가 inline-flex가 된다', async () => {
      const el = await renderInto((ref) => (
        <FlexColumn ref={ref} inlineFlex>
          x
        </FlexColumn>
      ));
      expect(getComputedStyle(el).display).toBe('inline-flex');
    });

    it('flexWrap 커스텀 값이 반영된다', async () => {
      const el = await renderInto((ref) => (
        <FlexColumn ref={ref} flexWrap='wrap'>
          x
        </FlexColumn>
      ));
      expect(getComputedStyle(el).flexWrap).toBe('wrap');
    });

    it('center=true, 명시 값 없음: alignItems/justifyContent가 기본값 center로 떨어진다', async () => {
      const el = await renderInto((ref) => (
        <FlexColumn ref={ref} center>
          x
        </FlexColumn>
      ));
      const style = getComputedStyle(el);
      expect(style.alignItems).toBe('center');
      expect(style.justifyContent).toBe('center');
    });

    it('center=true + 명시 justifyContent: 명시 값이 center보다 우선한다 (Stack과 반대 정책)', async () => {
      const el = await renderInto((ref) => (
        <FlexColumn ref={ref} center justifyContent='flex-end'>
          x
        </FlexColumn>
      ));
      const style = getComputedStyle(el);
      expect(style.justifyContent).toBe('flex-end');
      expect(style.alignItems).toBe('center');
    });

    it('callback ref로 렌더된 DOM 요소가 전달된다', async () => {
      const callbackRef = vi.fn();
      await mount(<FlexColumn ref={callbackRef}>x</FlexColumn>);
      expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLElement));
    });

    it('center=true + sx: sx가 있어도 center 기본값 계산에 영향 없이 sx 스타일도 함께 반영된다', async () => {
      const el = await renderInto((ref) => (
        <FlexColumn ref={ref} center sx={{ padding: 2 }}>
          x
        </FlexColumn>
      ));
      const style = getComputedStyle(el);
      expect(style.alignItems).toBe('center');
      expect(style.justifyContent).toBe('center');
      expect(style.padding).toBe('16px');
    });
  });

  describe('FlexColumn.Start', () => {
    it('프리셋 justifyContent=flex-start가 반영된다', async () => {
      const el = await renderInto((ref) => <FlexColumn.Start ref={ref}>x</FlexColumn.Start>);
      expect(getComputedStyle(el).justifyContent).toBe('flex-start');
    });

    it('명시 justifyContent를 전달하면 프리셋을 덮어쓴다', async () => {
      const el = await renderInto((ref) => (
        <FlexColumn.Start ref={ref} justifyContent='flex-end'>
          x
        </FlexColumn.Start>
      ));
      expect(getComputedStyle(el).justifyContent).toBe('flex-end');
    });

    it('sx로 전달한 스타일이 프리셋 justifyContent와 충돌 없이 함께 반영된다', async () => {
      const el = await renderInto((ref) => (
        <FlexColumn.Start ref={ref} sx={{ padding: 2 }}>
          x
        </FlexColumn.Start>
      ));
      const style = getComputedStyle(el);
      expect(style.justifyContent).toBe('flex-start');
      expect(style.padding).toBe('16px');
    });
  });

  describe('FlexColumn.End', () => {
    it('프리셋 justifyContent=flex-end가 반영된다', async () => {
      const el = await renderInto((ref) => <FlexColumn.End ref={ref}>x</FlexColumn.End>);
      expect(getComputedStyle(el).justifyContent).toBe('flex-end');
    });
  });

  describe('FlexColumn.Center', () => {
    it('프리셋 justifyContent=center가 반영된다', async () => {
      const el = await renderInto((ref) => <FlexColumn.Center ref={ref}>x</FlexColumn.Center>);
      expect(getComputedStyle(el).justifyContent).toBe('center');
    });
  });

  describe('FlexColumn.Between', () => {
    it('프리셋 justifyContent=space-between이 반영된다', async () => {
      const el = await renderInto((ref) => <FlexColumn.Between ref={ref}>x</FlexColumn.Between>);
      expect(getComputedStyle(el).justifyContent).toBe('space-between');
    });
  });

  describe('FlexColumn.Around', () => {
    it('프리셋 justifyContent=space-around가 반영된다', async () => {
      const el = await renderInto((ref) => <FlexColumn.Around ref={ref}>x</FlexColumn.Around>);
      expect(getComputedStyle(el).justifyContent).toBe('space-around');
    });
  });

  describe('FlexColumn.Evenly', () => {
    it('프리셋 justifyContent=space-evenly가 반영된다', async () => {
      const el = await renderInto((ref) => <FlexColumn.Evenly ref={ref}>x</FlexColumn.Evenly>);
      expect(getComputedStyle(el).justifyContent).toBe('space-evenly');
    });
  });

  it('FlexColumn 패밀리 7개 export의 displayName이 전부 정확히 설정된다', () => {
    expect(FlexColumn.displayName).toBe('FlexColumn');
    expect(FlexColumn.Start.displayName).toBe('FlexColumn.Start');
    expect(FlexColumn.End.displayName).toBe('FlexColumn.End');
    expect(FlexColumn.Center.displayName).toBe('FlexColumn.Center');
    expect(FlexColumn.Between.displayName).toBe('FlexColumn.Between');
    expect(FlexColumn.Around.displayName).toBe('FlexColumn.Around');
    expect(FlexColumn.Evenly.displayName).toBe('FlexColumn.Evenly');
  });
});
