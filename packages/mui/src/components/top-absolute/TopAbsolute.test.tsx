import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { TopAbsolute } from './TopAbsolute.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('TopAbsolute 패밀리 (characterization)', () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    vi.restoreAllMocks();
  });

  const renderInto = async (renderNode: (ref: { current: HTMLElement | null }) => ReactElement) => {
    const ref = { current: null as HTMLElement | null };
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
      root.render(renderNode(ref));
    });
    return ref.current as HTMLElement;
  };

  describe('TopAbsolute (base)', () => {
    it('기본값: top/left/right 모두 0px, position absolute', async () => {
      const el = await renderInto((ref) => <TopAbsolute ref={ref}>x</TopAbsolute>);
      const style = getComputedStyle(el);
      expect(style.position).toBe('absolute');
      expect(style.top).toBe('0px');
      expect(style.left).toBe('0px');
      expect(style.right).toBe('0px');
    });

    it('top/left/right 커스텀 값이 그대로 반영된다', async () => {
      const el = await renderInto((ref) => (
        <TopAbsolute ref={ref} top='15px' left='25px' right='35px'>
          x
        </TopAbsolute>
      ));
      const style = getComputedStyle(el);
      expect(style.top).toBe('15px');
      expect(style.left).toBe('25px');
      expect(style.right).toBe('35px');
    });

    it('callback ref로 렌더된 DOM 요소가 전달된다', async () => {
      const callbackRef = vi.fn();
      container = document.createElement('div');
      document.body.append(container);
      root = createRoot(container);
      await act(async () => {
        root.render(<TopAbsolute ref={callbackRef}>x</TopAbsolute>);
      });
      expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLElement));
    });

    it('fullWidth를 전달해도 width에 영향 없다 (base는 fullWidth 미지원)', async () => {
      const el = await renderInto((ref) => (
        // @ts-expect-error base는 fullWidth를 지원하지 않음 — 타입 위반을 강제해 런타임 동작을 특성화한다
        <TopAbsolute ref={ref} fullWidth>
          x
        </TopAbsolute>
      ));
      expect(getComputedStyle(el).width).not.toBe('100%');
    });
  });

  describe('TopAbsolute.Left', () => {
    it('기본값: left=0px, top=0px, fullWidth 미지정 시 width 100% 아님', async () => {
      const el = await renderInto((ref) => <TopAbsolute.Left ref={ref}>x</TopAbsolute.Left>);
      const style = getComputedStyle(el);
      expect(style.left).toBe('0px');
      expect(style.top).toBe('0px');
      expect(style.width).not.toBe('100%');
    });

    it('커스텀 값 + fullWidth가 반영된다', async () => {
      const el = await renderInto((ref) => (
        <TopAbsolute.Left ref={ref} top='15px' left='25px' fullWidth>
          x
        </TopAbsolute.Left>
      ));
      const style = getComputedStyle(el);
      expect(style.top).toBe('15px');
      expect(style.left).toBe('25px');
      expect(style.width).toBe('100%');
    });
  });

  describe('TopAbsolute.Right', () => {
    it('기본값: right=0px, top=0px', async () => {
      const el = await renderInto((ref) => <TopAbsolute.Right ref={ref}>x</TopAbsolute.Right>);
      const style = getComputedStyle(el);
      expect(style.right).toBe('0px');
      expect(style.top).toBe('0px');
    });

    it('커스텀 값 + fullWidth가 반영된다', async () => {
      const el = await renderInto((ref) => (
        <TopAbsolute.Right ref={ref} top='15px' right='35px' fullWidth>
          x
        </TopAbsolute.Right>
      ));
      const style = getComputedStyle(el);
      expect(style.top).toBe('15px');
      expect(style.right).toBe('35px');
      expect(style.width).toBe('100%');
    });
  });

  describe('TopAbsolute.Center', () => {
    it('현재 동작(비대칭 보존): top prop 미지정 시 기본값이 없어 computed top이 빈 문자열이다', async () => {
      const el = await renderInto((ref) => <TopAbsolute.Center ref={ref}>x</TopAbsolute.Center>);
      const style = getComputedStyle(el);
      expect(style.top).toBe('');
      expect(style.left).toBe('50%');
      expect(style.transform).toBe('translate(-50%, -50%)');
    });

    it('top 커스텀 값 + fullWidth가 반영된다', async () => {
      const el = await renderInto((ref) => (
        <TopAbsolute.Center ref={ref} top='15px' fullWidth>
          x
        </TopAbsolute.Center>
      ));
      const style = getComputedStyle(el);
      expect(style.top).toBe('15px');
      expect(style.left).toBe('50%');
      expect(style.transform).toBe('translate(-50%, -50%)');
      expect(style.width).toBe('100%');
    });
  });
});
