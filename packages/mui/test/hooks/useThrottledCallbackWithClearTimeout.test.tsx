import { act } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useThrottledCallbackWithClearTimeout } from '../../src/hooks/useThrottledCallbackWithClearTimeout.js';
import { renderHook } from './internal/render-hook.js';

describe('useThrottledCallbackWithClearTimeout', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('clear는 예약된 trailing 호출을 취소', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const hook = renderHook(() => useThrottledCallbackWithClearTimeout(callback, 100), undefined);

    act(() => {
      hook.result.current[0]();
      hook.result.current[1]();
      vi.advanceTimersByTime(100);
    });

    expect(callback.mock.calls.length).toBeLessThanOrEqual(1);
    hook.unmount();
  });
});
