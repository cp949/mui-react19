import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { BottomAbsolute } from './BottomAbsolute.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('BottomAbsolute 패밀리 (characterization)', () => {
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

  describe('BottomAbsolute (base)', () => {
    it('기본값: bottom/left/right 모두 0px', async () => {
      const el = await renderInto((ref) => <BottomAbsolute ref={ref}>x</BottomAbsolute>);
      const style = getComputedStyle(el);
      expect(style.position).toBe('absolute');
      expect(style.bottom).toBe('0px');
      expect(style.left).toBe('0px');
      expect(style.right).toBe('0px');
    });

    it('bottom/left/right 커스텀 값이 그대로 반영된다', async () => {
      const el = await renderInto((ref) => (
        <BottomAbsolute ref={ref} bottom='45px' left='25px' right='35px'>
          x
        </BottomAbsolute>
      ));
      const style = getComputedStyle(el);
      expect(style.bottom).toBe('45px');
      expect(style.left).toBe('25px');
      expect(style.right).toBe('35px');
    });

    it('callback ref로 렌더된 DOM 요소가 전달된다', async () => {
      const callbackRef = vi.fn();
      container = document.createElement('div');
      document.body.append(container);
      root = createRoot(container);
      await act(async () => {
        root.render(<BottomAbsolute ref={callbackRef}>x</BottomAbsolute>);
      });
      expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLElement));
    });

    it('fullWidth를 전달해도 width에 영향 없다 (base는 fullWidth 미지원)', async () => {
      const el = await renderInto((ref) => (
        // @ts-expect-error base는 fullWidth를 지원하지 않음 — 타입 위반을 강제해 런타임 동작을 특성화한다
        <BottomAbsolute ref={ref} fullWidth>
          x
        </BottomAbsolute>
      ));
      expect(getComputedStyle(el).width).not.toBe('100%');
    });
  });

  describe('BottomAbsolute.Left', () => {
    it('기본값: left=0px, bottom=0px, fullWidth 미지정 시 width 100% 아님', async () => {
      const el = await renderInto((ref) => <BottomAbsolute.Left ref={ref}>x</BottomAbsolute.Left>);
      const style = getComputedStyle(el);
      expect(style.left).toBe('0px');
      expect(style.bottom).toBe('0px');
      expect(style.width).not.toBe('100%');
    });

    it('커스텀 값 + fullWidth가 반영된다', async () => {
      const el = await renderInto((ref) => (
        <BottomAbsolute.Left ref={ref} bottom='45px' left='25px' fullWidth>
          x
        </BottomAbsolute.Left>
      ));
      const style = getComputedStyle(el);
      expect(style.bottom).toBe('45px');
      expect(style.left).toBe('25px');
      expect(style.width).toBe('100%');
    });
  });

  describe('BottomAbsolute.Right', () => {
    it('기본값: right=0px, bottom=0px', async () => {
      const el = await renderInto((ref) => (
        <BottomAbsolute.Right ref={ref}>x</BottomAbsolute.Right>
      ));
      const style = getComputedStyle(el);
      expect(style.right).toBe('0px');
      expect(style.bottom).toBe('0px');
    });

    it('커스텀 값 + fullWidth가 반영된다', async () => {
      const el = await renderInto((ref) => (
        <BottomAbsolute.Right ref={ref} bottom='45px' right='35px' fullWidth>
          x
        </BottomAbsolute.Right>
      ));
      const style = getComputedStyle(el);
      expect(style.bottom).toBe('45px');
      expect(style.right).toBe('35px');
      expect(style.width).toBe('100%');
    });
  });

  describe('BottomAbsolute.Center', () => {
    it('기본값: bottom=0px (TopAbsoluteCenter의 top과 달리 기본값이 존재)', async () => {
      const el = await renderInto((ref) => (
        <BottomAbsolute.Center ref={ref}>x</BottomAbsolute.Center>
      ));
      const style = getComputedStyle(el);
      expect(style.bottom).toBe('0px');
      expect(style.left).toBe('50%');
      expect(style.transform).toBe('translate(-50%, -50%)');
    });

    it('bottom 커스텀 값 + fullWidth가 반영된다', async () => {
      const el = await renderInto((ref) => (
        <BottomAbsolute.Center ref={ref} bottom='45px' fullWidth>
          x
        </BottomAbsolute.Center>
      ));
      const style = getComputedStyle(el);
      expect(style.bottom).toBe('45px');
      expect(style.width).toBe('100%');
    });
  });

  it('displayName이 유지된다', () => {
    expect(BottomAbsolute.displayName).toBe('BottomAbsolute');
    expect(BottomAbsolute.Left.displayName).toBe('BottomAbsolute.Left');
    expect(BottomAbsolute.Right.displayName).toBe('BottomAbsolute.Right');
    expect(BottomAbsolute.Center.displayName).toBe('BottomAbsolute.Center');
  });
});
