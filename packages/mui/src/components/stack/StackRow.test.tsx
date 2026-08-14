import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createDomHarness } from '../../test-utils/dom-harness.js';
import { StackRow } from './StackRow.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('StackRow 패밀리 (characterization)', () => {
  const { mount, renderInto, cleanup } = createDomHarness<HTMLDivElement>();

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('StackRow (main)', () => {
    it('기본값: display flex, flexDirection row, alignItems/justifyContent 미지정(빈 값)', async () => {
      const el = await renderInto((ref) => <StackRow ref={ref}>x</StackRow>);
      const style = getComputedStyle(el);
      expect(style.display).toBe('flex');
      expect(style.flexDirection).toBe('row');
      expect(style.alignItems).toBe('');
      expect(style.justifyContent).toBe('');
    });

    it('center=true: 명시 alignItems/justifyContent를 무시하고 강제로 center가 된다', async () => {
      const el = await renderInto((ref) => (
        <StackRow ref={ref} center alignItems='flex-start' justifyContent='space-around'>
          x
        </StackRow>
      ));
      const style = getComputedStyle(el);
      expect(style.alignItems).toBe('center');
      expect(style.justifyContent).toBe('center');
    });

    it('center=false + 명시 값: alignItems/justifyContent가 그대로 반영된다', async () => {
      const el = await renderInto((ref) => (
        <StackRow ref={ref} alignItems='flex-start' justifyContent='space-around'>
          x
        </StackRow>
      ));
      const style = getComputedStyle(el);
      expect(style.alignItems).toBe('flex-start');
      expect(style.justifyContent).toBe('space-around');
    });

    it('callback ref로 렌더된 DOM 요소가 전달된다', async () => {
      const callbackRef = vi.fn();
      await mount(<StackRow ref={callbackRef}>x</StackRow>);
      expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLElement));
    });

    it('center=true + sx: sx가 있어도 center 강제 override가 유지되고 sx 스타일도 반영된다', async () => {
      const el = await renderInto((ref) => (
        <StackRow ref={ref} center sx={{ padding: 2 }}>
          x
        </StackRow>
      ));
      const style = getComputedStyle(el);
      expect(style.alignItems).toBe('center');
      expect(style.justifyContent).toBe('center');
      expect(style.padding).toBe('16px');
    });
  });

  describe('StackRow.Start', () => {
    it('프리셋 justifyContent=flex-start가 반영된다', async () => {
      const el = await renderInto((ref) => <StackRow.Start ref={ref}>x</StackRow.Start>);
      expect(getComputedStyle(el).justifyContent).toBe('flex-start');
    });

    it('명시 justifyContent를 전달하면 프리셋을 덮어쓴다', async () => {
      const el = await renderInto((ref) => (
        <StackRow.Start ref={ref} justifyContent='space-evenly'>
          x
        </StackRow.Start>
      ));
      expect(getComputedStyle(el).justifyContent).toBe('space-evenly');
    });

    it('sx로 전달한 스타일이 프리셋 justifyContent와 충돌 없이 함께 반영된다', async () => {
      const el = await renderInto((ref) => (
        <StackRow.Start ref={ref} sx={{ padding: 2 }}>
          x
        </StackRow.Start>
      ));
      const style = getComputedStyle(el);
      expect(style.justifyContent).toBe('flex-start');
      expect(style.padding).toBe('16px');
    });
  });

  describe('StackRow.End', () => {
    it('프리셋 justifyContent=flex-end가 반영된다', async () => {
      const el = await renderInto((ref) => <StackRow.End ref={ref}>x</StackRow.End>);
      expect(getComputedStyle(el).justifyContent).toBe('flex-end');
    });
  });

  describe('StackRow.Between', () => {
    it('프리셋 justifyContent=space-between이 반영된다', async () => {
      const el = await renderInto((ref) => <StackRow.Between ref={ref}>x</StackRow.Between>);
      expect(getComputedStyle(el).justifyContent).toBe('space-between');
    });
  });

  describe('StackRow.Around', () => {
    it('프리셋 justifyContent=space-around가 반영된다', async () => {
      const el = await renderInto((ref) => <StackRow.Around ref={ref}>x</StackRow.Around>);
      expect(getComputedStyle(el).justifyContent).toBe('space-around');
    });
  });

  describe('StackRow.Center', () => {
    it('프리셋 justifyContent=center가 반영된다', async () => {
      const el = await renderInto((ref) => <StackRow.Center ref={ref}>x</StackRow.Center>);
      expect(getComputedStyle(el).justifyContent).toBe('center');
    });
  });

  describe('StackRow.Evenly', () => {
    it('프리셋 justifyContent=space-evenly가 반영된다', async () => {
      const el = await renderInto((ref) => <StackRow.Evenly ref={ref}>x</StackRow.Evenly>);
      expect(getComputedStyle(el).justifyContent).toBe('space-evenly');
    });
  });

  it('StackRow 패밀리 7개 export의 displayName이 전부 정확히 설정된다', () => {
    expect(StackRow.displayName).toBe('StackRow');
    expect(StackRow.Start.displayName).toBe('StackRow.Start');
    expect(StackRow.End.displayName).toBe('StackRow.End');
    expect(StackRow.Between.displayName).toBe('StackRow.Between');
    expect(StackRow.Around.displayName).toBe('StackRow.Around');
    expect(StackRow.Center.displayName).toBe('StackRow.Center');
    expect(StackRow.Evenly.displayName).toBe('StackRow.Evenly');
  });
});
