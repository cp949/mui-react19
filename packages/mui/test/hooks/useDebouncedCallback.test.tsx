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
});
