import { act } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useResizeObserver } from '../../src/hooks/useResizeObserver.js';
import { renderHook } from './internal/render-hook.js';

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  callback: ResizeObserverCallback;
  disconnect = vi.fn();
  observe = vi.fn();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }
}

describe('useResizeObserver', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    MockResizeObserver.instances = [];
  });

  test('ResizeObserver가 rect를 갱신하고 unmount 시 해제', () => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const element = document.createElement('div');
    const hook = renderHook(() => useResizeObserver<HTMLDivElement>(), undefined);

    act(() => {
      hook.result.current[0].current = element;
      hook.rerender(undefined);
    });

    act(() => {
      MockResizeObserver.instances[0].callback(
        [{ contentRect: { width: 120, height: 40 } as DOMRectReadOnly } as ResizeObserverEntry],
        MockResizeObserver.instances[0] as unknown as ResizeObserver,
      );
    });

    expect(hook.result.current[1].width).toBe(120);

    hook.unmount();
    expect(MockResizeObserver.instances[0].disconnect).toHaveBeenCalled();
  });
});
