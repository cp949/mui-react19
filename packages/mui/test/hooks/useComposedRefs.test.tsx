import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { useComposedRefs } from '../../src/hooks/useComposedRefs.js';
import { renderHook } from './internal/render-hook.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

describe('useComposedRefs', () => {
  describe('DOM ref 합성', () => {
    let container: HTMLDivElement | null = null;
    let root: Root | null = null;

    afterEach(() => {
      act(() => {
        root?.unmount();
      });
      root = null;
      container?.remove();
      container = null;
    });

    it('callback ref와 RefObject에 동시에 마운트된 노드를 설정한다', () => {
      // callback ref가 받은 노드 이력을 기록한다
      const received: Array<HTMLDivElement | null> = [];
      const refObject: { current: HTMLDivElement | null } = { current: null };

      const Comp = () => {
        const composed = useComposedRefs<HTMLDivElement>((node) => received.push(node), refObject);
        return <div ref={composed} data-testid='target' />;
      };

      container = document.createElement('div');
      document.body.append(container);
      root = createRoot(container);

      act(() => {
        root?.render(<Comp />);
      });

      const node = container.querySelector('[data-testid="target"]');
      expect(node).toBeInstanceOf(HTMLDivElement);
      expect(received[0]).toBe(node);
      expect(refObject.current).toBe(node);
    });

    it('unmount 시 callback ref와 RefObject에 null을 전파한다', () => {
      const received: Array<HTMLDivElement | null> = [];
      const refObject: { current: HTMLDivElement | null } = { current: null };

      const Comp = () => {
        const composed = useComposedRefs<HTMLDivElement>((node) => received.push(node), refObject);
        return <div ref={composed} />;
      };

      container = document.createElement('div');
      document.body.append(container);
      root = createRoot(container);

      act(() => {
        root?.render(<Comp />);
      });

      act(() => {
        root?.unmount();
      });
      root = null;

      // React가 cleanup 시 ref를 null로 호출한다
      expect(received.at(-1)).toBeNull();
      expect(refObject.current).toBeNull();
    });
  });

  describe('콜백 메모', () => {
    it('동일 refs로 재렌더해도 동일 콜백 참조를 반환한다', () => {
      // 콜백 바깥에서 안정 ref 2개를 1회 생성한다
      const refA: { current: unknown } = { current: null };
      const refB: { current: unknown } = { current: null };

      const hook = renderHook(
        (props: { a: typeof refA; b: typeof refB }) => useComposedRefs(props.a, props.b),
        { a: refA, b: refB },
      );

      const first = hook.result.current;
      hook.rerender({ a: refA, b: refB });

      expect(hook.result.current).toBe(first);
      hook.unmount();
    });
  });
});
