import { act } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useDebouncedValue } from '../../src/hooks/useDebouncedValue.js';
import { renderHook } from './internal/render-hook.js';

describe('useDebouncedValue', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('wait 이후 최신 value로 갱신', () => {
    vi.useFakeTimers();

    const hook = renderHook(({ value }: { value: string }) => useDebouncedValue(value, 100), {
      value: 'first',
    });

    hook.rerender({ value: 'second' });
    expect(hook.result.current[0]).toBe('first');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(hook.result.current[0]).toBe('second');
    hook.unmount();
  });

  test('cancel은 예약된 value 갱신을 취소', () => {
    vi.useFakeTimers();

    const hook = renderHook(({ value }: { value: string }) => useDebouncedValue(value, 100), {
      value: 'first',
    });

    hook.rerender({ value: 'second' });

    act(() => {
      hook.result.current[1]();
      vi.advanceTimersByTime(100);
    });

    expect(hook.result.current[0]).toBe('first');
    hook.unmount();
  });
});
