import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CenterAbsolute } from './CenterAbsolute.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('CenterAbsolute 패밀리 (characterization)', () => {
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

  describe('CenterAbsolute (base)', () => {
    it('기본값: left/right 0px, top 50% + translateY(-50%) 고정', async () => {
      const el = await renderInto((ref) => <CenterAbsolute ref={ref}>x</CenterAbsolute>);
      const style = getComputedStyle(el);
      expect(style.position).toBe('absolute');
      expect(style.top).toBe('50%');
      expect(style.left).toBe('0px');
      expect(style.right).toBe('0px');
      expect(style.transform).toBe('translateY(-50%)');
    });

    it('left/right 동시 커스텀 값이 반영된다 (다른 패밀리 base와 달리 두 축 동시 허용)', async () => {
      const el = await renderInto((ref) => (
        <CenterAbsolute ref={ref} left='25px' right='35px'>
          x
        </CenterAbsolute>
      ));
      const style = getComputedStyle(el);
      expect(style.left).toBe('25px');
      expect(style.right).toBe('35px');
    });

    it('callback ref로 렌더된 DOM 요소가 전달된다', async () => {
      const callbackRef = vi.fn();
      container = document.createElement('div');
      document.body.append(container);
      root = createRoot(container);
      await act(async () => {
        root.render(<CenterAbsolute ref={callbackRef}>x</CenterAbsolute>);
      });
      expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLElement));
    });

    it('fullWidth를 전달해도 width에 영향 없다 (base는 fullWidth 미지원)', async () => {
      const el = await renderInto((ref) => (
        // @ts-expect-error base는 fullWidth를 지원하지 않음 — 타입 위반을 강제해 런타임 동작을 특성화한다
        <CenterAbsolute ref={ref} fullWidth>
          x
        </CenterAbsolute>
      ));
      expect(getComputedStyle(el).width).not.toBe('100%');
    });
  });

  describe('CenterAbsolute.Left', () => {
    it('기본값: left=0px, top=50%, translateY(-50%)', async () => {
      const el = await renderInto((ref) => <CenterAbsolute.Left ref={ref}>x</CenterAbsolute.Left>);
      const style = getComputedStyle(el);
      expect(style.left).toBe('0px');
      expect(style.top).toBe('50%');
      expect(style.transform).toBe('translateY(-50%)');
    });

    it('커스텀 값 + fullWidth가 반영된다', async () => {
      const el = await renderInto((ref) => (
        <CenterAbsolute.Left ref={ref} left='25px' fullWidth>
          x
        </CenterAbsolute.Left>
      ));
      const style = getComputedStyle(el);
      expect(style.left).toBe('25px');
      expect(style.width).toBe('100%');
    });
  });

  describe('CenterAbsolute.Right', () => {
    it('기본값: right=0px, top=50%, translateY(-50%)', async () => {
      const el = await renderInto((ref) => (
        <CenterAbsolute.Right ref={ref}>x</CenterAbsolute.Right>
      ));
      const style = getComputedStyle(el);
      expect(style.right).toBe('0px');
      expect(style.top).toBe('50%');
      expect(style.transform).toBe('translateY(-50%)');
    });

    it('커스텀 값 + fullWidth가 반영된다', async () => {
      const el = await renderInto((ref) => (
        <CenterAbsolute.Right ref={ref} right='35px' fullWidth>
          x
        </CenterAbsolute.Right>
      ));
      const style = getComputedStyle(el);
      expect(style.right).toBe('35px');
      expect(style.width).toBe('100%');
    });
  });

  describe('CenterAbsolute.Center', () => {
    it('위치 조정 prop 없이 top/left 50%, translate(-50%, -50%) 고정', async () => {
      const el = await renderInto((ref) => (
        <CenterAbsolute.Center ref={ref}>x</CenterAbsolute.Center>
      ));
      const style = getComputedStyle(el);
      expect(style.top).toBe('50%');
      expect(style.left).toBe('50%');
      expect(style.transform).toBe('translate(-50%, -50%)');
    });

    it('fullWidth가 반영된다', async () => {
      const el = await renderInto((ref) => (
        <CenterAbsolute.Center ref={ref} fullWidth>
          x
        </CenterAbsolute.Center>
      ));
      const style = getComputedStyle(el);
      expect(style.width).toBe('100%');
    });
  });
});
