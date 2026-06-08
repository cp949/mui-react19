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
      hook.result.current[0](); // leading 즉시 실행
      hook.result.current[0](); // wait 구간 추가 호출 → trailing 예약
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      hook.result.current[1](); // clear: 예약된 trailing 타이머 취소
      vi.advanceTimersByTime(100);
    });

    // trailing 호출이 취소되어 leading 1회만 유지
    expect(callback).toHaveBeenCalledTimes(1);
    hook.unmount();
  });

  test('clear 없이 wait가 경과하면 trailing 호출이 실행', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const hook = renderHook(() => useThrottledCallbackWithClearTimeout(callback, 100), undefined);

    act(() => {
      hook.result.current[0](); // leading 즉시 실행
      hook.result.current[0](); // trailing 예약
      vi.advanceTimersByTime(100);
    });

    // leading + trailing = 2회
    expect(callback).toHaveBeenCalledTimes(2);
    hook.unmount();
  });
});
