import { act } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useDebouncedState } from '../../src/hooks/useDebouncedState.js';
import { renderHook } from './internal/render-hook.js';

describe('useDebouncedState', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('기본 옵션에서는 wait 이후 마지막으로 설정한 값으로 갱신', () => {
    vi.useFakeTimers();

    const hook = renderHook(() => useDebouncedState('first', 100), undefined);

    act(() => {
      hook.result.current[1]('second');
      hook.result.current[1]('third');
    });

    expect(hook.result.current[0]).toBe('first');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(hook.result.current[0]).toBe('third');
    hook.unmount();
  });

  test('leading:true면 첫 호출이 즉시 반영된다', () => {
    vi.useFakeTimers();

    const hook = renderHook(() => useDebouncedState('first', 100, { leading: true }), undefined);

    act(() => {
      hook.result.current[1]('second');
    });

    expect(hook.result.current[0]).toBe('second');
    hook.unmount();
  });

  test('unmount 시 예약된 갱신 타이머를 정리', () => {
    vi.useFakeTimers();
    const clearSpy = vi.spyOn(window, 'clearTimeout');

    const hook = renderHook(() => useDebouncedState('first', 100), undefined);

    act(() => {
      hook.result.current[1]('second');
    });
    clearSpy.mockClear();

    hook.unmount();

    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
