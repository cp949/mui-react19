import { act } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useTimeout } from '../../src/hooks/useTimeout.js';
import { renderHook } from './internal/render-hook.js';

describe('useTimeout', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('start는 최신 callback을 지연 실행', () => {
    vi.useFakeTimers();
    const calls: string[] = [];

    const hook = renderHook(
      ({ label }: { label: string }) =>
        useTimeout(() => {
          calls.push(label);
        }, 100),
      { label: 'first' },
    );

    hook.rerender({ label: 'second' });

    act(() => {
      hook.result.current.start();
      vi.advanceTimersByTime(100);
    });

    expect(calls).toEqual(['second']);
    hook.unmount();
  });

  test('clear는 예약된 timeout을 취소', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const hook = renderHook(() => useTimeout(callback, 100), undefined);

    act(() => {
      hook.result.current.start();
      hook.result.current.clear();
      vi.advanceTimersByTime(100);
    });

    expect(callback).not.toHaveBeenCalled();
    hook.unmount();
  });
});
