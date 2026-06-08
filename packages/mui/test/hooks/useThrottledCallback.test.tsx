import { act } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useThrottledCallback } from '../../src/hooks/useThrottledCallback.js';
import { renderHook } from './internal/render-hook.js';

describe('useThrottledCallback', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('leading 호출은 즉시 실행하고 trailing 호출은 최신 callback을 사용', () => {
    vi.useFakeTimers();
    const calls: string[] = [];

    const hook = renderHook(
      ({ label }: { label: string }) =>
        useThrottledCallback(() => {
          calls.push(label);
        }, 100),
      { label: 'first' },
    );

    // leading 호출은 즉시 실행된다
    act(() => {
      hook.result.current();
    });
    expect(calls).toEqual(['first']);

    // wait 구간 안의 추가 호출은 trailing으로 지연된다
    hook.rerender({ label: 'second' });
    act(() => {
      hook.result.current();
    });
    expect(calls).toEqual(['first']);

    // wait 경과 후 trailing 호출은 최신 callback(label='second')을 사용한다
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(calls).toEqual(['first', 'second']);

    hook.unmount();
  });
});
