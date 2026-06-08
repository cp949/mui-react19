import { act } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useDebouncedCallback } from '../../src/hooks/useDebouncedCallback.js';
import { renderHook } from './internal/render-hook.js';

describe('useDebouncedCallback', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('대기 시간 후 최신 callback을 호출', () => {
    vi.useFakeTimers();
    const calls: string[] = [];

    const hook = renderHook(
      ({ label }: { label: string }) =>
        useDebouncedCallback(() => {
          calls.push(label);
        }, 100),
      { label: 'first' },
    );

    act(() => {
      hook.result.current();
    });
    hook.rerender({ label: 'second' });
    act(() => {
      hook.result.current();
      vi.advanceTimersByTime(100);
    });

    expect(calls).toEqual(['second']);
    hook.unmount();
  });

  test('cancel은 대기 중인 trailing 호출을 취소', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const hook = renderHook(() => useDebouncedCallback(callback, 100), undefined);

    act(() => {
      hook.result.current();
      hook.result.current.cancel();
      vi.advanceTimersByTime(100);
    });

    expect(callback).not.toHaveBeenCalled();
    hook.unmount();
  });
});
