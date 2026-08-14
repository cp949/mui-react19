import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createDomHarness } from '../../test-utils/dom-harness.js';
import { StackColumn } from './StackColumn.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('StackColumn 패밀리 (characterization)', () => {
  const { mount, renderInto, cleanup } = createDomHarness<HTMLDivElement>();

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('StackColumn (main)', () => {
    it('기본값: display flex, flexDirection column, alignItems/justifyContent 미지정(빈 값)', async () => {
      const el = await renderInto((ref) => <StackColumn ref={ref}>x</StackColumn>);
      const style = getComputedStyle(el);
      expect(style.display).toBe('flex');
      expect(style.flexDirection).toBe('column');
      expect(style.alignItems).toBe('');
      expect(style.justifyContent).toBe('');
    });

    it('center=true: 명시 alignItems/justifyContent를 무시하고 강제로 center가 된다', async () => {
      const el = await renderInto((ref) => (
        <StackColumn ref={ref} center alignItems='flex-end' justifyContent='space-between'>
          x
        </StackColumn>
      ));
      const style = getComputedStyle(el);
      expect(style.alignItems).toBe('center');
      expect(style.justifyContent).toBe('center');
    });

    it('center=false + 명시 값: alignItems/justifyContent가 그대로 반영된다', async () => {
      const el = await renderInto((ref) => (
        <StackColumn ref={ref} alignItems='flex-end' justifyContent='space-between'>
          x
        </StackColumn>
      ));
      const style = getComputedStyle(el);
      expect(style.alignItems).toBe('flex-end');
      expect(style.justifyContent).toBe('space-between');
    });

    it('callback ref로 렌더된 DOM 요소가 전달된다', async () => {
      const callbackRef = vi.fn();
      await mount(<StackColumn ref={callbackRef}>x</StackColumn>);
      expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLElement));
    });

    it('center=true + sx: sx가 있어도 center 강제 override가 유지되고 sx 스타일도 반영된다', async () => {
      const el = await renderInto((ref) => (
        <StackColumn ref={ref} center sx={{ padding: 2 }}>
          x
        </StackColumn>
      ));
      const style = getComputedStyle(el);
      expect(style.alignItems).toBe('center');
      expect(style.justifyContent).toBe('center');
      expect(style.padding).toBe('16px');
    });
  });

  describe('StackColumn.Start', () => {
    it('프리셋 justifyContent=flex-start가 반영된다', async () => {
      const el = await renderInto((ref) => <StackColumn.Start ref={ref}>x</StackColumn.Start>);
      expect(getComputedStyle(el).justifyContent).toBe('flex-start');
    });

    it('명시 justifyContent를 전달하면 프리셋을 덮어쓴다', async () => {
      const el = await renderInto((ref) => (
        <StackColumn.Start ref={ref} justifyContent='space-evenly'>
          x
        </StackColumn.Start>
      ));
      expect(getComputedStyle(el).justifyContent).toBe('space-evenly');
    });

    it('sx로 전달한 스타일이 프리셋 justifyContent와 충돌 없이 함께 반영된다', async () => {
      const el = await renderInto((ref) => (
        <StackColumn.Start ref={ref} sx={{ padding: 2 }}>
          x
        </StackColumn.Start>
      ));
      const style = getComputedStyle(el);
      expect(style.justifyContent).toBe('flex-start');
      expect(style.padding).toBe('16px');
    });
  });

  describe('StackColumn.End', () => {
    it('프리셋 justifyContent=flex-end가 반영된다', async () => {
      const el = await renderInto((ref) => <StackColumn.End ref={ref}>x</StackColumn.End>);
      expect(getComputedStyle(el).justifyContent).toBe('flex-end');
    });
  });

  describe('StackColumn.Between', () => {
    it('프리셋 justifyContent=space-between이 반영된다', async () => {
      const el = await renderInto((ref) => <StackColumn.Between ref={ref}>x</StackColumn.Between>);
      expect(getComputedStyle(el).justifyContent).toBe('space-between');
    });
  });

  describe('StackColumn.Around', () => {
    it('프리셋 justifyContent=space-around가 반영된다', async () => {
      const el = await renderInto((ref) => <StackColumn.Around ref={ref}>x</StackColumn.Around>);
      expect(getComputedStyle(el).justifyContent).toBe('space-around');
    });
  });

  describe('StackColumn.Center', () => {
    it('프리셋 justifyContent=center가 반영된다', async () => {
      const el = await renderInto((ref) => <StackColumn.Center ref={ref}>x</StackColumn.Center>);
      expect(getComputedStyle(el).justifyContent).toBe('center');
    });
  });

  describe('StackColumn.Evenly', () => {
    it('프리셋 justifyContent=space-evenly가 반영된다', async () => {
      const el = await renderInto((ref) => <StackColumn.Evenly ref={ref}>x</StackColumn.Evenly>);
      expect(getComputedStyle(el).justifyContent).toBe('space-evenly');
    });
  });

  it('StackColumn 패밀리 7개 export의 displayName이 전부 정확히 설정된다', () => {
    expect(StackColumn.displayName).toBe('StackColumn');
    expect(StackColumn.Start.displayName).toBe('StackColumn.Start');
    expect(StackColumn.End.displayName).toBe('StackColumn.End');
    expect(StackColumn.Between.displayName).toBe('StackColumn.Between');
    expect(StackColumn.Around.displayName).toBe('StackColumn.Around');
    expect(StackColumn.Center.displayName).toBe('StackColumn.Center');
    expect(StackColumn.Evenly.displayName).toBe('StackColumn.Evenly');
  });
});
