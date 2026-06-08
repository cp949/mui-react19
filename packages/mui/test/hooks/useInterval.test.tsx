import { act } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useInterval } from '../../src/hooks/useInterval.js';
import { renderHook } from './internal/render-hook.js';

describe('useInterval', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('autoInvoke 상태에서 최신 callback을 호출', () => {
    vi.useFakeTimers();
    const calls: string[] = [];

    const hook = renderHook(
      ({ label }: { label: string }) =>
        useInterval(
          () => {
            calls.push(label);
          },
          100,
          { autoInvoke: true },
        ),
      { label: 'first' },
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(calls).toEqual(['first']);

    hook.rerender({ label: 'second' });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(calls).toEqual(['first', 'second']);

    hook.unmount();
  });

  test('unmount 시 interval을 정리', () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    const hook = renderHook(() => useInterval(callback, 100, { autoInvoke: true }), undefined);
    hook.unmount();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
