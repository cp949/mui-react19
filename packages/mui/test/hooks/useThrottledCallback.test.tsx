import { act } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useThrottledCallback } from '../../src/hooks/useThrottledCallback.js';
import { renderHook } from './internal/render-hook.js';

describe('useThrottledCallback', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('wait 간격 안에서 호출을 제한', () => {
    vi.useFakeTimers();
    const calls: string[] = [];

    const hook = renderHook(
      ({ label }: { label: string }) =>
        useThrottledCallback(() => {
          calls.push(label);
        }, 100),
      { label: 'first' },
    );

    act(() => {
      hook.result.current();
      hook.result.current();
      vi.advanceTimersByTime(100);
    });

    expect(calls.length).toBeLessThanOrEqual(2);
    hook.unmount();
  });
});
