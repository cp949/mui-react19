import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createDomHarness } from '../../test-utils/dom-harness.js';
import { FlexRow } from './FlexRow.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('FlexRow 패밀리 (characterization)', () => {
  const { mount, renderInto, cleanup } = createDomHarness();

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('FlexRow (main)', () => {
    it('기본값: display flex, flexDirection row, alignItems/justifyContent/flexWrap 미지정(빈 값)', async () => {
      const el = await renderInto((ref) => <FlexRow ref={ref}>x</FlexRow>);
      const style = getComputedStyle(el);
      expect(style.display).toBe('flex');
      expect(style.flexDirection).toBe('row');
      expect(style.alignItems).toBe('');
      expect(style.justifyContent).toBe('');
      expect(style.flexWrap).toBe('');
    });

    it('inlineFlex=true면 display가 inline-flex가 된다', async () => {
      const el = await renderInto((ref) => (
        <FlexRow ref={ref} inlineFlex>
          x
        </FlexRow>
      ));
      expect(getComputedStyle(el).display).toBe('inline-flex');
    });

    it('flexWrap 커스텀 값이 반영된다', async () => {
      const el = await renderInto((ref) => (
        <FlexRow ref={ref} flexWrap='wrap'>
          x
        </FlexRow>
      ));
      expect(getComputedStyle(el).flexWrap).toBe('wrap');
    });

    it('center=true, 명시 값 없음: alignItems/justifyContent가 기본값 center로 떨어진다', async () => {
      const el = await renderInto((ref) => (
        <FlexRow ref={ref} center>
          x
        </FlexRow>
      ));
      const style = getComputedStyle(el);
      expect(style.alignItems).toBe('center');
      expect(style.justifyContent).toBe('center');
    });

    it('center=true + 명시 justifyContent: 명시 값이 center보다 우선한다 (Stack과 반대 정책)', async () => {
      const el = await renderInto((ref) => (
        <FlexRow ref={ref} center justifyContent='flex-end'>
          x
        </FlexRow>
      ));
      const style = getComputedStyle(el);
      expect(style.justifyContent).toBe('flex-end');
      expect(style.alignItems).toBe('center');
    });

    it('callback ref로 렌더된 DOM 요소가 전달된다', async () => {
      const callbackRef = vi.fn();
      await mount(<FlexRow ref={callbackRef}>x</FlexRow>);
      expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLElement));
    });

    it('center=true + sx: sx가 있어도 center 기본값 계산에 영향 없이 sx 스타일도 함께 반영된다', async () => {
      const el = await renderInto((ref) => (
        <FlexRow ref={ref} center sx={{ padding: 2 }}>
          x
        </FlexRow>
      ));
      const style = getComputedStyle(el);
      expect(style.alignItems).toBe('center');
      expect(style.justifyContent).toBe('center');
      expect(style.padding).toBe('16px');
    });

    it('sx 배열에 falsy 값이 섞여도 나머지 스타일은 정상 반영된다(과거 filter(Boolean) 제거가 no-op임을 실증)', async () => {
      const el = await renderInto((ref) => (
        <FlexRow ref={ref} sx={[false, { padding: 2 }]}>
          x
        </FlexRow>
      ));
      expect(getComputedStyle(el).padding).toBe('16px');
    });
  });

  describe('FlexRow.Start', () => {
    it('프리셋 justifyContent=flex-start가 반영된다', async () => {
      const el = await renderInto((ref) => <FlexRow.Start ref={ref}>x</FlexRow.Start>);
      expect(getComputedStyle(el).justifyContent).toBe('flex-start');
    });

    it('명시 justifyContent를 전달하면 프리셋을 덮어쓴다', async () => {
      const el = await renderInto((ref) => (
        <FlexRow.Start ref={ref} justifyContent='flex-end'>
          x
        </FlexRow.Start>
      ));
      expect(getComputedStyle(el).justifyContent).toBe('flex-end');
    });

    it('sx로 전달한 스타일이 프리셋 justifyContent와 충돌 없이 함께 반영된다', async () => {
      const el = await renderInto((ref) => (
        <FlexRow.Start ref={ref} sx={{ padding: 2 }}>
          x
        </FlexRow.Start>
      ));
      const style = getComputedStyle(el);
      expect(style.justifyContent).toBe('flex-start');
      expect(style.padding).toBe('16px');
    });
  });

  describe('FlexRow.End', () => {
    it('프리셋 justifyContent=flex-end가 반영된다', async () => {
      const el = await renderInto((ref) => <FlexRow.End ref={ref}>x</FlexRow.End>);
      expect(getComputedStyle(el).justifyContent).toBe('flex-end');
    });
  });

  describe('FlexRow.Center', () => {
    it('프리셋 justifyContent=center가 반영된다', async () => {
      const el = await renderInto((ref) => <FlexRow.Center ref={ref}>x</FlexRow.Center>);
      expect(getComputedStyle(el).justifyContent).toBe('center');
    });
  });

  describe('FlexRow.Between', () => {
    it('프리셋 justifyContent=space-between이 반영된다', async () => {
      const el = await renderInto((ref) => <FlexRow.Between ref={ref}>x</FlexRow.Between>);
      expect(getComputedStyle(el).justifyContent).toBe('space-between');
    });
  });

  describe('FlexRow.Around', () => {
    it('프리셋 justifyContent=space-around가 반영된다', async () => {
      const el = await renderInto((ref) => <FlexRow.Around ref={ref}>x</FlexRow.Around>);
      expect(getComputedStyle(el).justifyContent).toBe('space-around');
    });
  });

  describe('FlexRow.Evenly', () => {
    it('프리셋 justifyContent=space-evenly가 반영된다', async () => {
      const el = await renderInto((ref) => <FlexRow.Evenly ref={ref}>x</FlexRow.Evenly>);
      expect(getComputedStyle(el).justifyContent).toBe('space-evenly');
    });
  });

  it('FlexRow 패밀리 7개 export의 displayName이 전부 정확히 설정된다', () => {
    expect(FlexRow.displayName).toBe('FlexRow');
    expect(FlexRow.Start.displayName).toBe('FlexRow.Start');
    expect(FlexRow.End.displayName).toBe('FlexRow.End');
    expect(FlexRow.Center.displayName).toBe('FlexRow.Center');
    expect(FlexRow.Between.displayName).toBe('FlexRow.Between');
    expect(FlexRow.Around.displayName).toBe('FlexRow.Around');
    expect(FlexRow.Evenly.displayName).toBe('FlexRow.Evenly');
  });
});
